/**
 * API-klient for kommunikasjon med backend-tjenester
 */

const API_URL = 'http://localhost:5002/api';

/**
 * Hjelper for å legge til autentiseringstoken på forespørsler
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('eiendomstoken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Håndterer forespørsler til API
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Noe gikk galt');
  }
  
  return data;
};

/**
 * Autentiseringstjenester
 */
export const authService = {
  /**
   * Registrerer en ny bruker
   */
  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  /**
   * Logger inn en bruker
   */
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  /**
   * Sjekker om brukeren er logget inn
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('eiendomstoken');
  },
  
  /**
   * Logger ut brukeren
   */
  logout: () => {
    localStorage.removeItem('eiendomstoken');
    localStorage.removeItem('eiendomsuser');
  },
  
  /**
   * Lagrer brukerdata i localStorage
   */
  setUserData: (token, user) => {
    localStorage.setItem('eiendomstoken', token);
    localStorage.setItem('eiendomsuser', JSON.stringify(user));
  },
  
  /**
   * Henter brukerdata fra localStorage
   */
  getUserData: () => {
    const userJson = localStorage.getItem('eiendomsuser');
    return userJson ? JSON.parse(userJson) : null;
  }
};

/**
 * Eiendomstjenester
 */
export const propertyService = {
  /**
   * Søker etter en eiendom basert på adresse
   */
  search: (address) => {
    return apiRequest(`/properties/search?address=${encodeURIComponent(address)}`);
  },
  
  /**
   * Henter detaljert informasjon om en eiendom
   */
  getProperty: (id) => {
    return apiRequest(`/properties/${id}`);
  },
  
  /**
   * Henter 3D-modelldata for en eiendom
   */
  get3DModelData: (id) => {
    return apiRequest(`/properties/${id}/3d-model`).catch(err => {
      console.warn('3D-modelldata er ikke tilgjengelig for denne eiendommen ennå');
      // Returnerer dummy-data når API-et ikke er implementert ennå
      return {
        plotWidth: 30,
        plotDepth: 40,
        buildingOptions: [
          {
            type: 'Enebolig',
            width: 15,
            depth: 10,
            height: 6
          }
        ]
      };
    });
  }
};

/**
 * Partnertjenester
 */
export const partnerService = {
  /**
   * Registrerer en ny bankpartner
   */
  registerBank: (data) => {
    return apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'bank' })
    });
  },
  
  /**
   * Registrerer en ny entreprenørpartner
   */
  registerContractor: (data) => {
    return apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'contractor' })
    });
  },
  
  /**
   * Registrerer en ny forsikringspartner
   */
  registerInsurance: (data) => {
    return apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify({ ...data, type: 'insurance' })
    });
  }
}; 