import React, { ReactNode } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button, Container, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Eiendomsmuligheter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link href="/" passHref>
                <MuiLink color="inherit" underline="none">
                  Eiendomsmuligheter
                </MuiLink>
              </Link>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="/" passHref>
                <Button color="inherit">Hjem</Button>
              </Link>
              <Link href="/analyze" passHref>
                <Button color="inherit">Analyser</Button>
              </Link>
              <Link href="/properties" passHref>
                <Button color="inherit">Eiendommer</Button>
              </Link>
              <Link href="/login" passHref>
                <Button color="inherit">Logg inn</Button>
              </Link>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Eiendomsmuligheter. Alle rettigheter reservert.
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              <Link href="/about" passHref>
                <MuiLink color="inherit" sx={{ mx: 1 }}>
                  Om oss
                </MuiLink>
              </Link>
              <Link href="/contact" passHref>
                <MuiLink color="inherit" sx={{ mx: 1 }}>
                  Kontakt
                </MuiLink>
              </Link>
              <Link href="/privacy" passHref>
                <MuiLink color="inherit" sx={{ mx: 1 }}>
                  Personvern
                </MuiLink>
              </Link>
            </Typography>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout; 