import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import PasswordChangeDialog from './PasswordChangeDialog';

const ProfessionalNavbar: React.FC = () => {
  const { user, logout, role } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  
  const isNoticePage = router.pathname === '/notice';
  const isLandingPage = router.pathname === '/';

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    // Navigate to profile page or open profile dialog
    console.log('Navigate to profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    setPasswordChangeOpen(true);
  };

  const handleDashboard = () => {
    handleMenuClose();
    router.push('/dashboard');
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const getRoleIcon = () => {
    return role === 'employee' ? <WorkIcon /> : <SchoolIcon />;
  };

  const getRoleColor = () => {
    return role === 'employee' ? 'success' : 'primary';
  };

  const getRoleLabel = () => {
    return role === 'employee' ? 'Admin' : 'Student';
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
      }}
    >
      <Toolbar sx={{ 
        py: 1, 
        px: { xs: 2, sm: 3, md: 4 },
        minHeight: '64px'
      }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            cursor: 'pointer',
            '&:hover': { opacity: 0.9 }
          }}
          onClick={() => router.push('/')}
          >
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 800, 
                color: '#1e3a8a',
                fontSize: '1.2rem'
              }}>
                CP
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                letterSpacing: '-0.02em'
              }}
            >
              Campus Placements
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Stack direction="row" spacing={2} alignItems="center">
            {user ? (
              <>

                {/* User Profile Dropdown */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getRoleIcon()}
                    label={getRoleLabel()}
                    color={getRoleColor() as any}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{
                      p: 0,
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                        color: '#1e3a8a',
                        fontWeight: 700,
                        fontSize: '1rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                </Box>

                {/* Profile Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 250,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      '& .MuiMenuItem-root': {
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5
                      }
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {/* User Info Header */}
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {getUserDisplayName()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {user?.email}
                    </Typography>
                    <Chip
                      icon={getRoleIcon()}
                      label={getRoleLabel()}
                      color={getRoleColor() as any}
                      size="small"
                      sx={{ mt: 1, fontSize: '0.75rem' }}
                    />
                  </Box>


                  <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                      <SecurityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Change Password" />
                  </MenuItem>

                  <Divider sx={{ my: 1 }} />

                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            ) : (isNoticePage || isLandingPage) && (
              <Button
                onClick={handleLogin}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Login
              </Button>
            )}
          </Stack>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && (
              <>
                <IconButton
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                
                <IconButton
                  onClick={handleMobileMenuOpen}
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}
            
            {!user && (isNoticePage || isLandingPage) && (
              <Button
                onClick={handleLogin}
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)'
                  }
                }}
              >
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              <MenuItem onClick={handleDashboard}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </MenuItem>
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={passwordChangeOpen}
        onClose={() => setPasswordChangeOpen(false)}
        user={user}
      />
    </AppBar>
  );
};

export default ProfessionalNavbar;
