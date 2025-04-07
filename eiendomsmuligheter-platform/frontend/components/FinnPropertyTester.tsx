import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material';
import PropertyChangeAnalyzer from '../visualization/PropertyChangeAnalyzer';

interface FinnPropertyTesterProps {
  className?: string;
}

const FinnPropertyTester: React.FC<FinnPropertyTesterProps> = ({
  className
}) => {
  const [finnCode, setFinnCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any | null>(null);
  const [testStarted, setTestStarted] = useState<boolean>(false);

  // Predefinerte Finn.no-koder fra oppgaven
  const predefinedCodes = [
    { code: '398489937', description: 'Enebolig i Oslo' },
    { code: '399772858', description: 'Leilighet i Bergen' },
    { code: '308214550', description: 'Rekkehus i Trondheim' },
    { code: '398595244', description: 'Enebolig i Stavanger' }
  ];

  // Håndter endring av Finn-kode
  const handleFinnCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFinnCode(event.target.value);
  };

  // Håndter testing av eiendom
  const handleTestProperty = async (code: string = finnCode) => {
    if (!code) {
      setError('Vennligst skriv inn en Finn.no-kode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPropertyData(null);
      setTestStarted(true);

      // Simuler API-kall for å hente eiendomsdata fra Finn.no
      // I en faktisk implementasjon ville dette vært et ekte API-kall
      // const response = await fetch(`/api/properties/finn/${code}`);
      // if (!response.ok) throw new Error('Kunne ikke hente eiendomsdata');
      // const data = await response.json();
      
      // Simuler respons for testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Testdata
      const mockPropertyData = {
        id: `prop-${code}`,
        finnCode: code,
        address: {
          street: 'Testveien 123',
          postalCode: '0123',
          city: 'Oslo'
        },
        type: 'house',
        numberOfFloors: 2,
        dimensions: {
          area: 150,
          livingArea: 120,
          lotSize: 500
        },
        features: ['garage'],
        price: 5500000,
        images: [
          'https://images.finncdn.no/dynamic/1280w/2023/2/vertical-0/23/2/298/489/937_1207066073.jpg'
        ],
        description: 'Flott enebolig med potensial for utleiedel.',
        url: `https://www.finn.no/realestate/homes/ad.html?finnkode=${code}`
      };
      
      setPropertyData(mockPropertyData) ;
      setLoading(false);
    } catch (err) {
      console.error('Feil ved testing av eiendom:', err);
      setError('Kunne ikke teste eiendom. Vennligst prøv igjen senere.');
      setLoading(false);
    }
  };

  // Håndter testing av predefinert kode
  const handleTestPredefined = (code: string) => {
    setFinnCode(code);
    handleTestProperty(code);
  };

  // Render predefinerte testkoder
  const renderPredefinedCodes = () => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Test med predefinerte annonser
        </Typography>
        <Grid container spacing={2}>
          {predefinedCodes.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Finn-kode: {item.code}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleTestPredefined(item.code)}
                    sx={{ mt: 1 }}
                  >
                    Test denne
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Render eiendomsdata
  const renderPropertyData = () => {
    if (!propertyData) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {propertyData.images && propertyData.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="250"
                  image={propertyData.images[0]}
                  alt={propertyData.address.street}
                  sx={{ borderRadius: 1 }}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 250, 
                    bgcolor: 'grey.200', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Ingen bilde tilgjengelig
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {propertyData.address.street}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {propertyData.address.postalCode} {propertyData.address.city}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={
                    propertyData.type === 'house' ? 'Enebolig' : 
                    propertyData.type === 'apartment' ? 'Leilighet' : 
                    propertyData.type === 'townhouse' ? 'Rekkehus' : 
                    'Bolig'
                  } 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${propertyData.dimensions.livingArea} m²`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${propertyData.numberOfFloors} etasje${propertyData.numberOfFloors > 1 ? 'r' : ''}`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body1" gutterBottom>
                {propertyData.description}
              </Typography>
              
              <Typography variant="h6" color="primary" gutterBottom>
                {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(propertyData.price)}
              </Typography>
              
              <Button 
                variant="outlined" 
                href={propertyData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                Se annonse på Finn.no
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Typography variant="h5" gutterBottom>
          Analyse av utleiemuligheter
        </Typography>
        <PropertyChangeAnalyzer propertyId={propertyData.id} finnCode={propertyData.finnCode} />
      </Box>
    );
  };

  return (
    <Box className={className}>
      <Typography variant="h4" gutterBottom>
        Test av Finn.no-annonser
      </Typography>
      <Typography variant="body1" paragraph>
        Test plattformen med eksisterende Finn.no-annonser for å se hvordan systemet analyserer og foreslår utleieenheter.
      </Typography>
      
      {renderPredefinedCodes()}
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h6" gutterBottom>
        Test med egen Finn.no-kode
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Finn.no-kode"
          variant="outlined"
          value={finnCode}
          onChange={handleFinnCodeChange}
          placeholder="F.eks. 398489937"
          size="small"
          sx={{ width: 250 }}
        />
        <Button 
          variant="contained" 
          onClick={() => handleTestProperty()}
          disabled={loading}
        >
          Test eiendom
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body1">
            Analyserer eiendom...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      )}
      
      {testStarted && !loading && !error && !propertyData && (
        <Alert severity="warning" sx={{ my: 3 }}>
          Kunne ikke finne eiendomsdata for den angitte Finn.no-koden.
        </Alert>
      )}
      
      {renderPropertyData()}
    </Box>
  );
};

export default FinnPropertyTester;
