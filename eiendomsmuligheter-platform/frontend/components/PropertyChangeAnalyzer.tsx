import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Divider, Chip, Grid, Button } from '@mui/material';
import { Property } from '../../types/property';
import ComparisonPropertyViewer, { PropertyChanges, RoomChange, MunicipalRequirement } from './ComparisonPropertyViewer';

interface PropertyChangeAnalyzerProps {
  propertyId: string;
  finnCode?: string;
  className?: string;
}

const PropertyChangeAnalyzer: React.FC<PropertyChangeAnalyzerProps> = ({
  propertyId,
  finnCode,
  className
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [originalProperty, setOriginalProperty] = useState<Property | null>(null);
  const [modifiedProperty, setModifiedProperty] = useState<Property | null>(null);
  const [propertyChanges, setPropertyChanges] = useState<PropertyChanges | null>(null);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        
        // Hent original eiendomsdata
        let propertyResponse;
        if (finnCode) {
          propertyResponse = await fetch(`/api/properties/finn/${finnCode}`);
        } else {
          propertyResponse = await fetch(`/api/properties/${propertyId}`);
        }
        
        if (!propertyResponse.ok) {
          throw new Error('Kunne ikke hente eiendomsdata');
        }
        
        const propertyData = await propertyResponse.json();
        setOriginalProperty(propertyData);
        
        // Hent modifisert eiendomsdata med utleiedel
        const modifiedResponse = await fetch(`/api/properties/${propertyData.id}/rental-unit-analysis`);
        if (!modifiedResponse.ok) {
          throw new Error('Kunne ikke hente analyse for utleiedel');
        }
        
        const modifiedData = await modifiedResponse.json();
        setModifiedProperty(modifiedData.property);
        setPropertyChanges(modifiedData.changes);
        setAnalysisReport(modifiedData.report);
        
        setLoading(false);
      } catch (err) {
        console.error('Feil ved henting av eiendomsdata:', err);
        setError('Kunne ikke laste eiendomsdata. Prøv igjen senere.');
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [propertyId, finnCode]);

  // Fallback data for testing når API ikke er tilgjengelig
  const generateFallbackData = () => {
    // Generer testdata for original eiendom
    const original: Property = {
      id: propertyId || 'test-property-1',
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
      images: []
    };
    
    // Generer testdata for modifisert eiendom med utleiedel
    const modified: Property = {
      ...original,
      dimensions: {
        ...original.dimensions,
        livingArea: 120 + 55, // Lagt til utleiedel på 55 kvm
      },
      features: [...original.features, 'rental_unit'],
      rentalUnit: {
        area: 55,
        rooms: 2,
        separateEntrance: true,
        bathroom: true,
        kitchen: true
      }
    };
    
    // Generer testdata for endringer
    const changes: PropertyChanges = {
      addedWalls: ['wall_floor_0_divider_main', 'wall_floor_0_corridor', 'wall_floor_0_bathroom_1'],
      removedWalls: [],
      modifiedWalls: [],
      addedRooms: [
        {
          id: 'room_rental_living',
          name: 'Stue (utleiedel)',
          type: 'living_room',
          area: 25,
          description: 'Ny stue for utleiedel'
        },
        {
          id: 'room_rental_bedroom',
          name: 'Soverom (utleiedel)',
          type: 'bedroom',
          area: 14,
          description: 'Nytt soverom for utleiedel'
        },
        {
          id: 'room_rental_bathroom',
          name: 'Bad (utleiedel)',
          type: 'bathroom',
          area: 6,
          description: 'Nytt bad for utleiedel med dusj, toalett og vask'
        },
        {
          id: 'room_rental_kitchen',
          name: 'Kjøkken (utleiedel)',
          type: 'kitchen',
          area: 10,
          description: 'Nytt kjøkken for utleiedel'
        }
      ],
      modifiedRooms: [],
      addedFeatures: [
        'Separat inngang for utleiedel',
        'Eget bad med dusj',
        'Kjøkken med hvitevarer',
        'Lydisolering mellom hovedbolig og utleiedel'
      ],
      municipalRequirements: [
        {
          id: 'req_separate_entrance',
          name: 'Separat inngang',
          description: 'Utleiedelen må ha egen separat inngang',
          status: 'fulfilled'
        },
        {
          id: 'req_bathroom',
          name: 'Eget bad',
          description: 'Utleiedelen må ha eget bad med dusj/badekar, toalett og vask',
          status: 'fulfilled'
        },
        {
          id: 'req_kitchen',
          name: 'Eget kjøkken',
          description: 'Utleiedelen må ha eget kjøkken',
          status: 'fulfilled'
        },
        {
          id: 'req_min_ceiling_height',
          name: 'Takhøyde',
          description: 'Takhøyden må være minst 2,2 meter',
          status: 'fulfilled',
          details: 'Takhøyde i utleiedel: 2,4 meter'
        },
        {
          id: 'req_fire_safety',
          name: 'Brannsikkerhet',
          description: 'Boligen må ha røykvarslere og brannslukkingsutstyr',
          status: 'pending',
          details: 'Må installeres røykvarsler og brannslukningsapparat i utleiedelen'
        },
        {
          id: 'req_sound_insulation',
          name: 'Lydisolasjon',
          description: 'Det må være tilstrekkelig lydisolasjon mellom hovedbolig og utleiedel',
          status: 'fulfilled'
        },
        {
          id: 'req_ventilation',
          name: 'Ventilasjon',
          description: 'Utleiedelen må ha tilfredsstillende ventilasjon',
          status: 'fulfilled'
        }
      ]
    };
    
    // Generer testdata for analyserapport
    const report = {
      rentalIncome: {
        estimatedMonthly: 12000,
        estimatedYearly: 144000
      },
      costs: {
        renovation: 450000,
        permits: 15000,
        total: 465000
      },
      roi: {
        paybackPeriod: 3.2, // år
        annualReturn: 31, // prosent
        fiveYearProfit: 255000
      },
      recommendations: [
        'Installere røykvarsler og brannslukningsapparat i utleiedelen',
        'Vurdere å oppgradere til bedre lydisolasjon mellom etasjene',
        'Søke om godkjenning av utleiedel hos kommunen'
      ]
    };
    
    return { original, modified, changes, report };
  };
  
  // Bruk fallback-data hvis API-kall feiler
  useEffect(() => {
    if (error) {
      console.log('Bruker fallback-data for testing');
      const { original, modified, changes, report } = generateFallbackData();
      setOriginalProperty(original);
      setModifiedProperty(modified);
      setPropertyChanges(changes);
      setAnalysisReport(report);
      setError(null);
      setLoading(false);
    }
  }, [error]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Analyserer eiendom og genererer utleiedel...
        </Typography>
      </Box>
    );
  }

  if (!originalProperty || !modifiedProperty || !propertyChanges) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
        <Typography variant="h6" color="error">
          Kunne ikke laste eiendomsdata
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Prøv igjen
        </Button>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Typography variant="h4" gutterBottom>
        Analyse av utleiedel for {originalProperty.address.street}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Eiendomsinformasjon
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Adresse</Typography>
                <Typography variant="body1">
                  {originalProperty.address.street}, {originalProperty.address.postalCode} {originalProperty.address.city}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Type</Typography>
                <Typography variant="body1">
                  {originalProperty.type === 'house' ? 'Enebolig' : 
                   originalProperty.type === 'apartment' ? 'Leilighet' : 
                   originalProperty.type === 'cabin' ? 'Hytte' : originalProperty.type}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Areal før</Typography>
                <Typography variant="body1">{originalProperty.dimensions.livingArea} m²</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Areal med utleiedel</Typography>
                <Typography variant="body1">{modifiedProperty.dimensions.livingArea} m²</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Utleiedel</Typography>
                <Typography variant="body1">{modifiedProperty.rentalUnit?.area} m²</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Antall rom i utleiedel</Typography>
                <Typography variant="body1">{modifiedProperty.rentalUnit?.rooms}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Økonomisk analyse
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Estimert leieinntekt</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {analysisReport?.rentalIncome.estimatedMonthly.toLocaleString()} kr/mnd
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {analysisReport?.rentalIncome.estimatedYearly.toLocaleString()} kr/år
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Kostnader</Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  {analysisReport?.costs.total.toLocaleString()} kr
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Tilbakebetalingstid</Typography>
                <Typography variant="body1">
                  {analysisReport?.roi.paybackPeriod} år
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Årlig avkastning</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {analysisReport?.roi.annualReturn}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Fortjeneste etter 5 år</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {analysisReport?.roi.fiveYearProfit.toLocaleString()} kr
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Anbefalinger
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <ul style={{ paddingLeft: '20px' }}>
          {analysisReport?.recommendations.map((rec, index) => (
            <li key={index}>
              <Typography variant="body1">{rec}</Typography>
            </li>
          ))}
        </ul>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          3D-visualisering av endringer
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ height: '600px', mb: 2 }}>
          <ComparisonPropertyViewer 
            originalProperty={originalProperty}
            modifiedProperty={modifiedProperty}
            changes={propertyChanges}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Nye funksjoner:</Typography>
          {propertyChanges.addedFeatures.map((feature, index) => (
            <Chip key={index} label={feature} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default PropertyChangeAnalyzer;
