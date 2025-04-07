import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Button,
  Divider
} from '@mui/material';
import { 
  Speed as SpeedIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import FinnPropertyTester from './FinnPropertyTester';
import BatchTestResults from './BatchTestResults';

interface TestingDashboardProps {
  className?: string;
}

const TestingDashboard: React.FC<TestingDashboardProps> = ({
  className
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Håndter tab-endring
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box className={className}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Testplattform for Eiendomsmuligheter
        </Typography>
        <Typography variant="body1">
          Bruk denne plattformen til å teste funksjonaliteten for analyse av utleieenheter med eksisterende Finn.no-annonser.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            href="/dashboard"
          >
            Tilbake til dashboard
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          aria-label="testing tabs"
        >
          <Tab icon={<SpeedIcon />} label="Individuell testing" iconPosition="start" />
          <Tab icon={<ViewListIcon />} label="Batch-testing" iconPosition="start" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <FinnPropertyTester />
          )}
          
          {activeTab === 1 && (
            <BatchTestResults />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TestingDashboard;
