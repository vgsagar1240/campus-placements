import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import DriveCreate from '../widgets/DriveCreate';
import MonitorPanel from '../widgets/MonitorPanel';
import ApplicantsList from '../widgets/ApplicantsList';
import CodingLeaderboard from '../widgets/CodingLeaderboard';
import PasswordChangeDialog from '../components/PasswordChangeDialog';
import { useAuth } from '../contexts/AuthContext';
import { 
  Typography, 
  Box, 
  Fab, 
  Stack, 
  Button,
  Card,
  CardContent,
  Fade,
  Slide,
  Avatar,
  Chip,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Skeleton,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Add as AddIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// InviteCodeManager Component
const InviteCodeManager = () => {
  const [inviteCode, setInviteCode] = useState('EMPLOYEE2025');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save invite code to Firestore
      const inviteCodeRef = doc(db, 'settings', 'inviteCode');
      await setDoc(inviteCodeRef, {
        code: inviteCode,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSnackbar({ open: true, message: 'Invite code updated successfully!', severity: 'success' });
      setEditing(false);
    } catch (error) {
      console.error('Error updating invite code:', error);
      setSnackbar({ open: true, message: 'Failed to update invite code', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Load invite code from database on component mount
  useEffect(() => {
    const loadInviteCode = async () => {
      try {
        const inviteCodeRef = doc(db, 'settings', 'inviteCode');
        const inviteCodeDoc = await getDoc(inviteCodeRef);
        
        if (inviteCodeDoc.exists()) {
          const data = inviteCodeDoc.data();
          setInviteCode(data.code || 'EMPLOYEE2025');
        }
      } catch (error) {
        console.error('Error loading invite code:', error);
        // Keep default value if loading fails
      }
    };

    loadInviteCode();
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <SecurityIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Employee Invite Code
        </Typography>
        <Box sx={{ flex: 1 }} />
        {!editing ? (
          <IconButton onClick={() => setEditing(true)} size="small">
            <EditIcon />
          </IconButton>
        ) : (
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setEditing(false)} size="small">
              <CloseIcon />
            </IconButton>
            <IconButton onClick={handleSave} size="small" disabled={saving}>
              <SaveIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>

      {editing ? (
        <TextField
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          fullWidth
          size="small"
          label="Invite Code"
          placeholder="Enter new invite code"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
      ) : (
        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Current Invite Code:
          </Typography>
          <Typography variant="h6" sx={{ 
            fontFamily: 'monospace', 
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: 1
          }}>
            {inviteCode}
          </Typography>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Students can use this code during registration to gain employee access.
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// StatCard Component for better reusability
const StatCard = ({ stat, loading, index }: { stat: any, loading: boolean, index: number }) => (
  <Grid item xs={12} sm={6} lg={4} key={stat.label}>
    <Slide direction="up" in timeout={800 + index * 200}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'white',
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            borderColor: stat.color
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {loading ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="80%" height={16} />
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar 
                sx={{ 
                  bgcolor: `${stat.color}15`,
                  color: stat.color,
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {stat.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    lineHeight: 1.1,
                    mb: 1
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: 0.5
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    opacity: 0.8
                  }}
                >
                  {stat.description}
                </Typography>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Slide>
  </Grid>
);

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeDrives: 0,
      totalApplications: 0,
      pendingNotices: 0,
      upcomingDrives: 0,
      placementRate: '0%'
    },
    recentActivity: [],
    upcomingDrives: [],
    recentNotices: [],
    performanceMetrics: {
      applicationRate: 0,
      conversionRate: 0,
      studentEngagement: 0
    }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active drives count
      const drivesQuery = query(collection(db, 'drives'), where('status', '==', 'active'));
      const drivesSnapshot = await getDocs(drivesQuery);
      const activeDrives = drivesSnapshot.size;

      // Fetch total applications
      const applicationsSnapshot = await getDocs(collection(db, 'driveApplications'));
      const totalApplications = applicationsSnapshot.size;

      // Fetch pending notices
      const noticesSnapshot = await getDocs(collection(db, 'notices'));
      const pendingNotices = noticesSnapshot.size;

      // Fetch upcoming drives
      const upcomingSnapshot = await getDocs(query(collection(db, 'drives'), where('status', '==', 'active')));
      const upcomingDrives = upcomingSnapshot.size;

      // Fetch recent activity
      const activityQuery = query(
        collection(db, 'driveApplications'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const recentActivity = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        title: `Application for ${doc.data().driveId || 'Drive'}`,
        timestamp: doc.data().createdAt,
        ...doc.data()
      }));

      // Fetch recent notices
      const recentNoticesQuery = query(
        collection(db, 'notices'),
        orderBy('createdAtTs', 'desc'),
        limit(3)
      );
      const noticesSnapshot2 = await getDocs(recentNoticesQuery);
      const recentNotices = noticesSnapshot2.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate metrics
      const placedStudents = await getDocs(query(collection(db, 'driveApplications'), where('status', '==', 'placed')));
      const totalApplicationsForRate = Math.max(totalApplications, 1);
      const placementRate = Math.round((placedStudents.size / totalApplicationsForRate) * 100);

      const applicationRate = Math.min(Math.round((totalApplications / 50) * 100), 100);
      const conversionRate = placementRate;
      const studentEngagement = Math.min(Math.round((recentActivity.length / 5) * 100), 100);

      setDashboardData({
        stats: {
          activeDrives,
          totalApplications,
          pendingNotices,
          upcomingDrives,
          placementRate: `${placementRate}%`
        },
        recentActivity,
        upcomingDrives: upcomingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        recentNotices,
        performanceMetrics: {
          applicationRate,
          conversionRate,
          studentEngagement
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time listeners
    const drivesUnsub = onSnapshot(collection(db, 'drives'), fetchDashboardData);
    const applicationsUnsub = onSnapshot(collection(db, 'driveApplications'), fetchDashboardData);

    return () => {
      drivesUnsub();
      applicationsUnsub();
    };
  }, []);

  const stats = [
    { 
      label: 'Active Drives', 
      value: dashboardData.stats.activeDrives, 
      icon: <TrendingUpIcon />, 
      color: '#1976d2',
      description: 'Ongoing placement drives'
    },
    { 
      label: 'Total Applications', 
      value: dashboardData.stats.totalApplications.toLocaleString(), 
      icon: <GroupIcon />, 
      color: '#ed6c02',
      description: 'Applications received'
    },
    { 
      label: 'Placement Rate', 
      value: dashboardData.stats.placementRate, 
      icon: <CheckCircleIcon />, 
      color: '#2e7d32',
      description: 'Overall success rate'
    }
  ];

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDate(date);
  };

  const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Avatar sx={{ 
        bgcolor: 'primary.main',
        width: 48,
        height: 48
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          fontSize: { xs: '1.25rem', md: '1.5rem' }
        }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ 
          fontSize: { xs: '0.9rem', md: '1rem' }
        }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={3}
              sx={{ mb: 4 }}
            >
              <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {getGreeting()}, {getUserDisplayName()}!
              </Typography>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.25rem', md: '3rem' },
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    lineHeight: 1.1
                  }}
                >
                  Placement Dashboard
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 400,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    maxWidth: '600px'
                  }}
                >
                  Comprehensive overview of placement activities, student progress, and recruitment analytics
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  icon={<WorkIcon style={{ color: 'white' }} />}                  
                  label="Admin Access"
                  variant="filled"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem'
                  }}
                />
                <IconButton 
                  onClick={fetchDashboardData}
                  disabled={loading}
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    '&:hover': { 
                      bgcolor: 'grey.50',
                      transform: 'rotate(180deg)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Stack>
            </Stack>

            {/* Stats Grid */}
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} loading={loading} index={index} />
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Primary Content */}
           <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Drive Management Section */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'white',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 3, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
                  }}>
                    <SectionHeader
                      icon={<WorkIcon />}
                      title="Drive Management"
                      subtitle="Create and manage placement drives"
                    />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <DriveCreate />
                  </Box>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

          {/* Right Column - Sidebar */}
           <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Recent Activity */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      fontSize: '1.125rem'
                    }}>
                      Recent Activity
                    </Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {loading ? (
                      Array.from(new Array(4)).map((_, index) => (
                        <ListItem key={index} sx={{ px: 2.5, py: 1.5 }}>
                          <ListItemIcon>
                            <Skeleton variant="circular" width={40} height={40} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Skeleton variant="text" width="80%" />}
                            secondary={<Skeleton variant="text" width="60%" />}
                          />
                        </ListItem>
                      ))
                    ) : dashboardData.recentActivity.length > 0 ? (
                      <List sx={{ p: 0 }}>
                        {dashboardData.recentActivity.map((activity, index) => (
                          <ListItem 
                            key={activity.id} 
                            divider={index < dashboardData.recentActivity.length - 1}
                            sx={{ px: 2.5, py: 1.5 }}
                          >
                            <ListItemIcon>
                              <Avatar sx={{ 
                                bgcolor: 'primary.light', 
                                width: 36, 
                                height: 36,
                                fontSize: '0.9rem'
                              }}>
                                <NotificationsIcon sx={{ fontSize: 18 }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                                  {activity.title || 'New Activity'}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {getTimeAgo(activity.timestamp)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ 
                          fontSize: 48, 
                          color: 'text.disabled', 
                          mb: 2,
                          opacity: 0.5
                        }} />
                        <Typography color="text.secondary" variant="body2">
                          No recent activity
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}>
                    Performance Metrics
                  </Typography>
                  <Stack spacing={3}>
                    {[
                      { label: 'Application Rate', value: dashboardData.performanceMetrics.applicationRate, color: '#1976d2' },
                      { label: 'Conversion Rate', value: dashboardData.performanceMetrics.conversionRate, color: '#2e7d32' },
                      { label: 'Student Engagement', value: dashboardData.performanceMetrics.studentEngagement, color: '#ed6c02' }
                    ].map((metric, index) => (
                      <Box key={metric.label}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: metric.color, 
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}>
                            {loading ? <Skeleton width={30} /> : `${metric.value}%`}
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant={loading ? "indeterminate" : "determinate"}
                          value={metric.value}
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.100',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: metric.color,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Admin Settings */}
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}>
                    Admin Settings
                  </Typography>
                  
                  <Stack spacing={2}>
                    <InviteCodeManager />
                    
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={() => setPasswordChangeOpen(true)}
                      sx={{
                        borderRadius: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.dark',
                          backgroundColor: 'rgba(30, 58, 138, 0.04)'
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {/* <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'white'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { icon: <WorkIcon />, label: 'Manage Drives', color: 'primary' },
                      { icon: <GroupIcon />, label: 'Student Reports', color: 'secondary' },
                      { icon: <TrendingUpIcon />, label: 'View Analytics', color: 'success' },
                    ].map((action) => (
                      <Button 
                        key={action.label}
                        variant="outlined" 
                        startIcon={action.icon}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start', 
                          py: 1.75,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          borderColor: 'grey.300',
                          color: 'text.primary',
                          '&:hover': {
                            backgroundColor: `${action.color}.light`,
                            borderColor: `${action.color}.main`,
                            transform: 'translateY(-1px)',
                            boxShadow: 1
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card> */}
            </Stack>
          </Grid>
        </Grid>

        {/* Student Applications - Full Width */}
        <Box sx={{ mt: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'white',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
              }}>
                <SectionHeader
                  icon={<GroupIcon />}
                  title="Student Applications"
                  subtitle="Manage and review student applications"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <ApplicantsList />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Coding Leaderboard - Full Width */}
        <Box sx={{ mt: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'white',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
              }}>
                <SectionHeader
                  icon={<TrendingUpIcon />}
                  title="Coding Leaderboard"
                  subtitle="Top performing students in coding assessments"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <CodingLeaderboard />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Monitoring Panel - Full Width */}
        <Box sx={{ mt: 3 }}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'white',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
              }}>
                <SectionHeader
                  icon={<NotificationsIcon />}
                  title="Announcements & Monitoring"
                  subtitle="Real-time monitoring and announcement management"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <MonitorPanel />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Floating Action Button */}
        <Fab 
          color="primary" 
          onClick={() => document.getElementById('create-drive')?.scrollIntoView({ behavior: 'smooth' })}
          sx={{ 
            position: 'fixed', 
            bottom: { xs: 20, md: 30 }, 
            right: { xs: 20, md: 30 },
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <AddIcon sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }} />
        </Fab>

        {/* Password Change Dialog */}
        <PasswordChangeDialog
          open={passwordChangeOpen}
          onClose={() => setPasswordChangeOpen(false)}
          user={user}
        />
      </Container>
    </Box>
  );
}