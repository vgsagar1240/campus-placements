import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import '../src/styles/globals.css';
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Container,
  Box
} from '@mui/material';
import ProfessionalNavbar from '../src/components/ProfessionalNavbar';
import InactivityWarningDialog from '../src/components/InactivityWarningDialog';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a',
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569'
    },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
    info: { main: '#3b82f6' },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: `'Inter', 'Segoe UI', 'Roboto', 'Helvetica', sans-serif`,
    h5: { fontWeight: 700, fontSize: '1.25rem' },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease'
        },
        contained: {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e3a8a',
              borderWidth: 2
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 28
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1rem'
        }
      }
    }
  }
});


// Component to handle inactivity warning dialog
function AppWithInactivityWarning({ Component, pageProps }: AppProps) {
  const { 
    showInactivityWarning, 
    inactivityTimeRemaining, 
    resetInactivityTimer, 
    logout 
  } = useAuth();

  const handleStayLoggedIn = () => {
    resetInactivityTimer();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.08) 0%, transparent 50%)',
            zIndex: 0
          }
        }}
      >
        <ProfessionalNavbar />
        <Box
          component="main"
          sx={{
            py: { xs: 3, sm: 4, md: 5 },
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Container maxWidth="xl">
            <Component {...pageProps} />
          </Container>
        </Box>
      </Box>

      <InactivityWarningDialog
        open={showInactivityWarning}
        timeRemaining={inactivityTimeRemaining}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppWithInactivityWarning Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}