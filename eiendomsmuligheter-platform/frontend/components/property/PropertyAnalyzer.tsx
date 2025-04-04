import React, { useState } from 'react';
import { Box, Button, Card, CircularProgress, Container, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Property3DViewer from '../visualization/Property3DViewer';

interface PropertyData {
  address: string;
  area: number;
  current_utilization: number;
}

interface AnalysisResult {
  property_id: string;
  address: string;
  analysis_date: string;
  regulations: any[];
  building_potential: {
    max_buildable_area: number;
    additional_buildable_area: number;
    max_height: number;
    max_units: number;
    optimal_configuration: string;
    estimated_build_time: string;
    constraints: string[];
  };
  economic_potential: {
    potential_value_estimate: number;
    roi_estimate: number;
    market_price_per_sqm: number;
    demand_index: number;
    growth_forecast: number;
  };
  energy_profile?: {
    energy_class: string;
    heating_demand: number;
    cooling_demand: number;
    primary_energy_source: string;
    recommendations: string[];
  };
  risk_assessment: {
    risk_level: string;
    risk_factors: string[];
  };
  recommendations: string[];
}

const PropertyAnalyzer: React.FC = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: '',
    area: 0,
    current_utilization: 0,
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPropertyData({
      ...propertyData,
      [name]: name === 'address' ? value : Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // For testing/debugging
    console.log('Sending property data:', propertyData);

    try {
      // Endre til å bruke API-ruting via Next.js
      const response = await axios.post('/api/properties/analyze', propertyData);
      console.log('API-respons:', response.data);
      setAnalysisResult(response.data);
    } catch (err) {
      console.error('Error analyzing property:', err);
      setError('Kunne ikke analysere eiendommen. Vennligst prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO').format(Math.round(num));
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'lav':
        return 'success.main';
      case 'middels':
        return 'warning.main';
      case 'høy':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Eiendomsanalyse
      </Typography>
        <Typography variant="body1" paragraph>
          Fyll inn eiendomsinformasjonen nedenfor for å få en detaljert analyse av utviklingspotensialet.
        </Typography>
      
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
        <TextField
                  required
          fullWidth
          label="Adresse"
                  name="address"
                  value={propertyData.address}
                  onChange={handleInputChange}
                  helperText="F.eks. Storgata 5, 0155 Oslo"
                />
              </Grid>
              <Grid item xs={12} md={6}>
        <TextField
                  required
          fullWidth
                  type="number"
                  label="Tomteareal (m²)"
                  name="area"
                  value={propertyData.area || ''}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  helperText="Tomtens størrelse i kvadratmeter"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Nåværende utnyttelsesgrad"
                  name="current_utilization"
                  value={propertyData.current_utilization || ''}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  helperText="Tall mellom 0 og 1, f.eks. 0.25 for 25% utnyttet"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analysér eiendom'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {error && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'error.light' }}>
            <Typography color="error.dark">{error}</Typography>
          </Paper>
        )}

        {analysisResult && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Analyseresultat for {analysisResult.address}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Analysedato: {new Date(analysisResult.analysis_date).toLocaleDateString('nb-NO')}
            </Typography>

            <Grid container spacing={4}>
              {/* Bygningspotensial */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Bygningspotensial
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Maksimalt byggbart areal
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysisResult.building_potential.max_buildable_area)} m²
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tilgjengelig utviklingspotensial
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysisResult.building_potential.additional_buildable_area)} m²
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Maksimal byggehøyde
                    </Typography>
                    <Typography variant="h6">
                      {analysisResult.building_potential.max_height} meter
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Optimalt prosjekt
                    </Typography>
                    <Typography variant="h6">
                      {analysisResult.building_potential.optimal_configuration}
                    </Typography>
                    <Typography variant="body2">
                      {analysisResult.building_potential.max_units} enheter
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Estimert byggetid
                    </Typography>
                    <Typography variant="h6">
                      {analysisResult.building_potential.estimated_build_time}
                    </Typography>
                  </Box>
                  
                  {analysisResult.building_potential.constraints.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Begrensninger
                      </Typography>
                      <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                        {analysisResult.building_potential.constraints.map((constraint, index) => (
                          <li key={index}>
                            <Typography variant="body2">{constraint}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Økonomisk potensial */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Økonomisk potensial
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Verdipotensial
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {formatNumber(analysisResult.economic_potential.potential_value_estimate)} kr
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ROI estimat
                    </Typography>
                    <Typography variant="h6">
                      {(analysisResult.economic_potential.roi_estimate * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Markedspris per m²
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysisResult.economic_potential.market_price_per_sqm)} kr/m²
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Etterspørselsindeks
                    </Typography>
                    <Typography variant="h6">
                      {(analysisResult.economic_potential.demand_index * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Forventet årlig vekst
                    </Typography>
                    <Typography variant="h6">
                      {(analysisResult.economic_potential.growth_forecast * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Regulering */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Reguleringsbestemmelser
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {analysisResult.regulations.map((regulation, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {regulation.description}
                      </Typography>
                      <Typography variant="h6">
                        {regulation.value} {regulation.unit}
                      </Typography>
                    </Box>
                  ))}
                </Card>
              </Grid>

              {/* Risikovurdering */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Risikovurdering
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Risikonivå
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ color: getRiskColor(analysisResult.risk_assessment.risk_level) }}
                    >
                      {analysisResult.risk_assessment.risk_level.toUpperCase()}
                    </Typography>
                  </Box>
                  
                  {analysisResult.risk_assessment.risk_factors.length > 0 ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Risikofaktorer
                      </Typography>
                      <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                        {analysisResult.risk_assessment.risk_factors.map((factor, index) => (
                          <li key={index}>
                            <Typography variant="body2">{factor}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Ingen spesifikke risikofaktorer identifisert.
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Anbefalinger */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Anbefalinger
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <li key={index}>
                        <Typography variant="body1" paragraph>{recommendation}</Typography>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Grid>

              {/* Energiprofil hvis tilgjengelig */}
              {analysisResult.energy_profile && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Energiprofil
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Energiklasse
                          </Typography>
                          <Typography variant="h6">
                            {analysisResult.energy_profile.energy_class}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Oppvarmingsbehov
                          </Typography>
                          <Typography variant="h6">
                            {analysisResult.energy_profile.heating_demand} kWh/m²
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Kjølebehov
                          </Typography>
                          <Typography variant="h6">
                            {analysisResult.energy_profile.cooling_demand} kWh/m²
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Primær energikilde
                          </Typography>
                          <Typography variant="h6">
                            {analysisResult.energy_profile.primary_energy_source}
                          </Typography>
      </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Energianbefalinger
                        </Typography>
                        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                          {analysisResult.energy_profile.recommendations.map((recommendation, index) => (
                            <li key={index}>
                              <Typography variant="body2">{recommendation}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}

              {/* 3D-visualisering av eiendommen */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    3D-visualisering
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ height: 500, mb: 2 }}>
          <Property3DViewer
                      property={{
                        id: analysisResult.property_id,
                        name: analysisResult.address,
                        type: 'residential',
                        status: 'available',
                        address: {
                          street: analysisResult.address,
                          number: '',
                          postalCode: '',
                          city: '',
                          country: 'Norge'
                        },
                        dimensions: {
                          length: Math.sqrt(propertyData.area),
                          width: Math.sqrt(propertyData.area),
                          height: analysisResult.building_potential.max_height,
                          area: propertyData.area
                        },
                        numberOfFloors: 2,
                        createdAt: analysisResult.analysis_date,
                        updatedAt: analysisResult.analysis_date,
                        userId: 'user1'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Dette er en forenklet 3D-modell av eiendommen basert på innlagte data og optimale utviklingsmuligheter.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
        </Box>
      )}
      </Box>
    </Container>
  );
};

export default PropertyAnalyzer;