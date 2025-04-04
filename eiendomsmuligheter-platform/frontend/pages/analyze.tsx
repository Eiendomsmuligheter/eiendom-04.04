import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import PropertyAnalyzer from '../components/property/PropertyAnalyzer';
import Layout from '../components/layout/Layout';

const AnalyzePage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Eiendomsanalyse | Eiendomsmuligheter</title>
        <meta name="description" content="Analyser eiendomspotensial og utviklingsmuligheter" />
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Analyser Eiendomspotensial
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Få en detaljert analyse av utviklingspotensialet for din eiendom ved hjelp av vår avanserte AI-teknologi.
          </Typography>
        </Box>
        
        <PropertyAnalyzer />
      </Container>
    </Layout>
  );
};

export default AnalyzePage; 