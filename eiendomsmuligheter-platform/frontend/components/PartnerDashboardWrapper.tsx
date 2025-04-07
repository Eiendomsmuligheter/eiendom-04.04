import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import PartnerProjectDashboard from './PartnerProjectDashboard';

interface PartnerDashboardWrapperProps {
  partnerId: string;
  className?: string;
}

const PartnerDashboardWrapper: React.FC<PartnerDashboardWrapperProps> = ({
  partnerId,
  className
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Testdata for prosjekter
  const projects = [
    {
      id: 'proj-123',
      name: 'Utleiedel Testveien 123',
      address: 'Testveien 123, 0123 Oslo',
      status: 'in_progress',
      progress: 65,
      client: 'Ola Nordmann'
    },
    {
      id: 'proj-124',
      name: 'Utleiedel Eksempelgata 45',
      address: 'Eksempelgata 45, 0987 Bergen',
      status: 'planning',
      progress: 25,
      client: 'Kari Nordmann'
    },
    {
      id: 'proj-125',
      name: 'Utleiedel Prøvevegen 78',
      address: 'Prøvevegen 78, 7030 Trondheim',
      status: 'completed',
      progress: 100,
      client: 'Per Hansen'
    },
    {
      id: 'proj-126',
      name: 'Utleiedel Testvegen 90',
      address: 'Testvegen 90, 4021 Stavanger',
      status: 'review',
      progress: 85,
      client: 'Lisa Andersen'
    }
  ];

  // Statistikk for partnerdashboard
  const stats = {
    activeProjects: 3,
    completedProjects: 1,
    totalRevenue: 1250000,
    averageRating: 4.8
  };

  // Håndter tab-endring
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedProject(null); // Nullstill valgt prosjekt når vi bytter tab
  };

  // Håndter prosjektvalg
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  // Gå tilbake til prosjektoversikten
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  // Render prosjektoversikt
  const renderProjectsOverview = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Prosjektoversikt
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {stats.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktive prosjekter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.completedProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fullførte prosjekter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total omsetning
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {stats.averageRating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gjennomsnittlig rating
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Dine prosjekter
          </Typography>
          <Button variant="contained" size="small">
            Nytt prosjekt
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.address}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Kunde: {project.client}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      Fremdrift: {project.progress}%
                    </Typography>
                    <Box sx={{ width: '100%', bgcolor: 'background.default', borderRadius: 1, height: 8, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${project.progress}%`,
                          bgcolor: 
                            project.status === 'completed' ? 'success.main' : 
                            project.status === 'in_progress' ? 'warning.main' : 
                            project.status === 'review' ? 'secondary.main' : 'info.main',
                          height: '100%',
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 
                          project.status === 'completed' ? 'success.light' : 
                          project.status === 'in_progress' ? 'warning.light' : 
                          project.status === 'review' ? 'secondary.light' : 'info.light',
                        color: 
                          project.status === 'completed' ? 'success.contrastText' : 
                          project.status === 'in_progress' ? 'warning.contrastText' : 
                          project.status === 'review' ? 'secondary.contrastText' : 'info.contrastText',
                      }}
                    >
                      {project.status === 'completed' ? 'Fullført' : 
                       project.status === 'in_progress' ? 'Pågår' : 
                       project.status === 'review' ? 'Under vurdering' : 'Planlegging'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    Se detaljer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box className={className}>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          aria-label="partner dashboard tabs"
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" iconPosition="start" />
          <Tab icon={<BusinessIcon />} label="Prosjekter" iconPosition="start" />
          <Tab icon={<AssignmentIcon />} label="Oppgaver" iconPosition="start" />
          <Tab icon={<PersonIcon />} label="Profil" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Innstillinger" iconPosition="start" />
        </Tabs>
      </Paper>
      
      <Box sx={{ p: 2 }}>
        {activeTab === 0 && (
          <Typography variant="h5" gutterBottom>
            Velkommen til partnerdashboardet
          </Typography>
        )}
        
        {activeTab === 1 && (
          <>
            {selectedProject ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={handleBackToProjects}
                  sx={{ mb: 2 }}
                >
                  Tilbake til prosjektoversikt
                </Button>
                <PartnerProjectDashboard 
                  projectId={selectedProject} 
                  partnerId={partnerId} 
                />
              </>
            ) : (
              renderProjectsOverview()
            )}
          </>
        )}
        
        {activeTab === 2 && (
          <Typography variant="h5" gutterBottom>
            Oppgaveoversikt
          </Typography>
        )}
        
        {activeTab === 3 && (
          <Typography variant="h5" gutterBottom>
            Profilinnstillinger
          </Typography>
        )}
        
        {activeTab === 4 && (
          <Typography variant="h5" gutterBottom>
            Systeminnstillinger
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PartnerDashboardWrapper;
