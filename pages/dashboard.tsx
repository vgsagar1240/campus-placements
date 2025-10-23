import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import StudentDashboard from '../src/sections/StudentDashboard';
import EmployeeDashboard from '../src/sections/EmployeeDashboard';
import { useRouter } from 'next/router';
import {
  CircularProgress,
  Box,
  Typography,
  Fade,
  Slide,
  Card,
  CardContent,
  Stack,
  Chip,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function DashboardPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Debug logging
  console.log('Dashboard - Role:', role, 'Loading:', loading);

  if (loading) {
    return (
      <Fade in timeout={600}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          sx={{
            width: '100%',
            px: { xs: 2, sm: 4 },
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: 4,
            border: '1px solid rgba(30, 58, 138, 0.1)'
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (!role) {
    router.push('/');
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        boxSizing: 'border-box'
      }}
    >
      {/* Header Section */}
      {/* <Fade in timeout={800}>
        <Card
          elevation={6}
          sx={{
            width: '100%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
  <Stack
    direction={isMobile ? 'column' : 'row'}
    alignItems={isMobile ? 'flex-start' : 'center'}
    spacing={2}
    sx={{ mb: 2 }}
    flexWrap="wrap"
  >
    <DashboardIcon sx={{ fontSize: 40 }} />
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Placements Dashboard
      </Typography>
      <Chip
        icon={role === 'student' ? <SchoolIcon /> : <WorkIcon />}
        label={role === 'student' ? 'Student Portal' : 'Employee Portal'}
        sx={{
          mt: 1.5,
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#fff',
          fontWeight: 600,
          borderRadius: 2,
          px: 1.5,
          py: 0.5
        }}
      />
    </Box>
  </Stack>

  <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 720 }}>
    {role === 'student'
      ? 'Explore job opportunities, manage your applications, and stay updated with placement activities.'
      : 'Create and manage placement drives, monitor applications, and broadcast important notices.'}
  </Typography>
</CardContent>
        </Card>
      </Fade> */}

      {/* Dashboard Content */}
      <Slide direction="up" in timeout={1000}>
        <Box sx={{ width: '100%' }}>
          {role === 'student' && <StudentDashboard />}
          {role === 'employee' && <EmployeeDashboard />}
        </Box>
      </Slide>
    </Box>
  );
}