const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios'); 
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Mockdata for eiendom (siden vi ikke har en database ennå)
const propertyData = {
  'solbergveien-47': {
    id: 'solbergveien-47',
    address: 'Solbergveien 47, 3057 Solbergmoen',
    municipality: 'Drammen',
    plotSize: 850,
    zoning: 'Bolig',
    allowedBuildingHeight: 9,
    maxBuildableArea: 420,
    coordinates: { lat: 59.7563, lng: 10.2548 },
    buildingOptions: [
      {
        type: 'Enebolig',
        maxSize: 250,
        estimatedCost: 6250000,
        estimatedValue: 8500000,
        roi: 36
      },
      {
        type: 'Tomannsbolig',
        maxSize: 380,
        estimatedCost: 9500000,
        estimatedValue: 12800000,
        roi: 34.7
      }
    ],
    zoneRestrictions: [
      'Maksimal byggehøyde: 9 meter',
      'Minimum avstand til nabogrense: 4 meter',
      'Utnyttelsesgrad: 30%'
    ]
  }
};

// Mockdata for brukere
let users = [];

// Konfigurasjon
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'eiendomsmuligheter_development_jwt_secret';
const JWT_EXPIRES_IN = '7d';

// Opprett Express-app
const app = express();

// Middleware for logging
app.use(morgan('dev'));

// Sikkerhetsmiddleware
app.use(helmet({
  contentSecurityPolicy: false, // Deaktiverer CSP i utvikling
  crossOriginEmbedderPolicy: false, // For å tillate embedding i utvikling
}));

// CORS-konfigurasjon
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://eiendomsmuligheter.no', 'https://www.eiendomsmuligheter.no'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enkel autentisering middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen autentiserings-token' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ugyldig token' });
  }
};

// Proxy middleware for Python-API - for avanserte funksjoner 
// som 3D-modellering, reguleringsplan-analyse osv.
app.use('/api/python', createProxyMiddleware({
  target: PYTHON_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/python': '', // Fjerner /api/python-prefiks
  },
  onProxyReq: (proxyReq, req, res) => {
    // Vi kan legge til headers, autentisering osv. her
    if (req.user) {
      proxyReq.setHeader('X-User-ID', req.user.id);
    }
  },
  logLevel: 'debug'
}));

// API-endepunkter
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', version: '1.0.0' });
});

// Eiendom API
app.get('/api/properties/search', (req, res) => {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Adresse må oppgis' });
  }
  
  // Enkel søk (case-insensitiv)
  const normalizedAddress = address.toLowerCase();
  
  // Sjekk om adressen inneholder "solbergveien"
  if (normalizedAddress.includes('solbergveien')) {
    const propertyId = 'solbergveien-47';
    const property = propertyData[propertyId];
    
    if (property) {
      return res.json({
        id: propertyId,
        address: property.address,
        municipality: property.municipality,
        plotSize: property.plotSize,
        coordinates: property.coordinates
      });
    }
  }
  
  // Proxy til Python-API for mer avansert søk
  axios.get(`${PYTHON_API_URL}/api/property/search?address=${encodeURIComponent(address)}`)
    .then(response => {
      if (response.data) {
        return res.json(response.data);
      }
      return res.status(404).json({ error: 'Eiendom ikke funnet' });
    })
    .catch(err => {
      console.error('Error from Python API:', err.message);
      // Fallback hvis Python-API er utilgjengelig
      res.status(404).json({ error: 'Eiendom ikke funnet' });
    });
});

app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const property = propertyData[id];
  
  if (property) {
    return res.json(property);
  }
  
  // Prøv å hente fra Python-API
  axios.get(`${PYTHON_API_URL}/api/property/${id}`)
    .then(response => {
      if (response.data) {
        return res.json(response.data);
      }
      return res.status(404).json({ error: 'Eiendom ikke funnet' });
    })
    .catch(err => {
      console.error('Error from Python API:', err.message);
      res.status(404).json({ error: 'Eiendom ikke funnet' });
    });
});

// Bruker API
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, userType } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Manglende påkrevde felt' });
  }
  
  // Sjekk om bruker allerede eksisterer
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Bruker eksisterer allerede' });
  }
  
  // Hash passord
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  // Lag ny bruker
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password: hashedPassword,
    fullName,
    userType: userType || 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Generer JWT
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, userType: newUser.userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Returner bruker uten passord
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ 
    token,
    user: userWithoutPassword
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'E-post og passord må oppgis' });
  }
  
  // Finn bruker
  const user = users.find(user => user.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Ugyldig e-post eller passord' });
  }
  
  // Generer JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, userType: user.userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Returner bruker uten passord
  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    token,
    user: userWithoutPassword
  });
});

// Partners API
app.post('/api/partners', authenticate, (req, res) => {
  // Dette ville normalt lagre partner-data i en database
  res.status(201).json({ success: true, message: 'Partnerregistrering mottatt' });
});

// Statisk filservering (for frontend)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/out')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
  });
}

// Start serveren
app.listen(PORT, () => {
  console.log(`Express API kjører på port ${PORT}`);
  console.log(`Python API URL: ${PYTHON_API_URL}`);
}); 