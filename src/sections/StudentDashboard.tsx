import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import PasswordChangeDialog from '../components/PasswordChangeDialog';
import { useAuth } from '../contexts/AuthContext';
import driveAutoCompletionService from '../services/driveAutoCompletionService';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Avatar,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Fade,
  Slide,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CardActions,
  useMediaQuery,
  useTheme,
  IconButton,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  Container,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  Work as WorkIcon,
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import UnifiedCodingDashboard from '../widgets/UnifiedCodingDashboard';

// Enhanced Resume Upload Component
const ResumeUploadSection = ({ 
  resumeUploaded, 
  uploadingResume, 
  onResumeUpload,
  onFileSelect,
  currentResumeName 
}) => (
  <Fade in timeout={600}>
    <Card 
      elevation={0}
      sx={{ 
        mb: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        }
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3}>
          <Avatar sx={{ 
            bgcolor: 'white',
            color: resumeUploaded ? 'success.main' : 'primary.main',
            width: 56,
            height: 56,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            {resumeUploaded ? <CheckCircleIcon /> : <UploadIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {resumeUploaded ? 'Resume Management' : 'Complete Your Profile'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              {resumeUploaded 
                ? `Your resume "${currentResumeName}" is uploaded and ready for applications`
                : 'Upload your resume to unlock placement drive applications and career opportunities'
              }
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button 
                variant="contained" 
                component="label"
                startIcon={resumeUploaded ? <UploadIcon /> : <UploadIcon />}
                disabled={uploadingResume}
                sx={{ 
                  borderRadius: 3,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  minWidth: 200,
                  backgroundColor: 'white',
                  color: resumeUploaded ? 'white' : 'primary.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {uploadingResume ? 'Uploading...' : resumeUploaded ? 'Replace Resume' : 'Upload Resume (PDF)'}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={onFileSelect}
                />
              </Button>
              
              {resumeUploaded && (
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                  onClick={() => {
                    // Open resume in new tab if it's stored as base64
                    const userRef = doc(db, 'users', auth.currentUser?.uid);
                    getDoc(userRef).then(doc => {
                      const userData = doc.data();
                      if (userData?.resumeData) {
                        const link = document.createElement('a');
                        link.href = userData.resumeData;
                        link.target = '_blank';
                        link.click();
                      }
                    });
                  }}
                >
                  View Resume
                </Button>
              )}
              
              <Typography variant="caption" sx={{ opacity: 0.8, maxWidth: 300 }}>
                {resumeUploaded 
                  ? 'You can replace your resume anytime with a new PDF file'
                  : 'Supported format: PDF • Max size: 5MB • Required for drive applications'
                }
              </Typography>
            </Stack>
          </Box>
        </Stack>
        
        {uploadingResume && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress 
              sx={{ 
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  </Fade>
);

// Enhanced Drive Card Component
const DriveCard = ({ drive, hasApplied, getApplicationStatus, onApply, isMobile }) => {
  const applied = hasApplied(drive.id);
  const status = getApplicationStatus(drive.id);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Under Review';
      default: return 'Applied';
    }
  };

  const formatDriveDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date TBD';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const getDriveStatusInfo = () => {
    const driveDate = new Date(drive.driveDate);
    const now = new Date();
    const timeDiff = driveDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { label: 'Expired', color: 'error', icon: <CloseIcon /> };
    } else if (daysDiff === 0) {
      return { label: 'Today', color: 'warning', icon: <ScheduleIcon /> };
    } else if (daysDiff <= 3) {
      return { label: `${daysDiff} days left`, color: 'warning', icon: <ScheduleIcon /> };
    } else {
      return { label: `${daysDiff} days left`, color: 'info', icon: <ScheduleIcon /> };
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          borderColor: 'primary.light',
        },
      }}
    >
      {/* Status Indicator */}
      {applied && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          <Chip
            label={getStatusLabel(status)}
            color={getStatusColor(status)}
            variant="filled"
            size="small"
            sx={{ 
              fontWeight: 700,
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2.5 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 56, 
            height: 56,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}>
            <WorkIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1, mr: applied ? 4 : 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                lineHeight: 1.3,
                mb: 1.5,
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                color: 'text.primary',
              }}
            >
              {drive.title}
            </Typography>
            
            {/* Drive Meta Information */}
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                label={formatDriveDate(drive.driveDate)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {drive.company && (
                <Chip
                  icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                  label={drive.company}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2.5,
            lineHeight: 1.6,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}
        >
          {drive.description || 'No description available.'}
        </Typography>

        {/* Eligibility Criteria */}
        {drive.eligibility && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem',
                display: 'block',
                mb: 1,
              }}
            >
              Eligibility Criteria
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.5,
                fontSize: '0.875rem',
              }}
            >
              {drive.eligibility}
            </Typography>
          </Box>
        )}

        {/* Additional Info */}
        {(drive.location || drive.package) && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {drive.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {drive.location}
                </Typography>
              </Box>
            )}
            {drive.package && (
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                {drive.package}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>

      <CardActions sx={{ p: 3, pt: 1 }}>
        <Button 
          variant={applied ? "outlined" : "contained"}
          fullWidth 
          onClick={() => onApply(drive)}
          size="medium"
          disabled={applied}
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            ...(applied ? {
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                borderColor: 'success.dark',
                backgroundColor: 'success.light',
                color: 'success.dark',
              }
            } : {
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              }
            })
          }}
        >
          {applied ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon fontSize="small" />
              <span>Application Submitted</span>
            </Stack>
          ) : (
            'Apply Now'
          )}
        </Button>
      </CardActions>
    </Card>
  );
};

// Enhanced Notices Section Component
const NoticesSection = ({ notices }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (notices.length === 0) return null;

  return (
    <Slide direction="up" in timeout={1200}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: 'white',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                bgcolor: 'warning.main',
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px rgba(255, 167, 38, 0.3)',
              }}>
                <NotificationsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Latest Notices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Important announcements and updates
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', maxHeight: isMobile ? '400px' : '500px' }}>
            <List sx={{ py: 0 }}>
              {notices.slice(0, 6).map((notice, index) => (
                <React.Fragment key={notice.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      alignItems: 'flex-start',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: 'warning.light', 
                        mr: 2, 
                        mt: 0.5, 
                        width: 40, 
                        height: 40,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(255, 167, 38, 0.2)',
                      }}
                    >
                      <SchoolIcon fontSize="small" />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {notice.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {notice.body}
                        </Typography>
                      }
                    />
                    {notice.createdAt && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          ml: 2, 
                          flexShrink: 0,
                          minWidth: 60,
                          textAlign: 'right'
                        }}
                      >
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </ListItem>
                  {index < Math.min(notices.length, 6) - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );
};



// Stats Cards Component for Placement Drives
const DriveStatsCards = ({ drives, applications }) => {
  const stats = [
    {
      label: 'Active Drives',
      value: drives.length,
      color: 'primary',
      icon: <WorkIcon />,
    },
    {
      label: 'Applications',
      value: applications.length,
      color: 'secondary',
      icon: <DescriptionIcon />,
    },
    {
      label: 'Accepted',
      value: applications.filter(app => app.status === 'accepted').length,
      color: 'success',
      icon: <CheckCircleIcon />,
    },
    {
      label: 'Pending',
      value: applications.filter(app => app.status === 'pending').length,
      color: 'warning',
      icon: <ScheduleIcon />,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
          <Slide direction="up" in timeout={800 + index * 200}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                borderRadius: 3,
                background: 'white',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>
                {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: `${stat.color}.main`, fontSize: '1.5rem' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                {stat.label}
              </Typography>
            </Paper>
          </Slide>
        </Grid>
      ))}
    </Grid>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [notices, setNotices] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [queryText, setQueryText] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [currentResumeName, setCurrentResumeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Toast notification helper
  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const q = query(collection(db, 'drives'), where('status', '==', 'active'));
        const unsub = onSnapshot(q, (snapshot) => {
          const drivesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setDrives(drivesData);
          setLoading(false);
        });
        return unsub;
      } catch (error) {
        console.error('Error fetching drives:', error);
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setResumeUploaded(!!userData?.resumeData);
        setCurrentResumeName(userData?.resumeName || '');
      } catch (error) {
        console.error('Error fetching resume status:', error);
      }
    };
    fetchResume();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAtTs', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, 'driveApplications'), where('userId', '==', auth.currentUser?.uid));
        const unsub = onSnapshot(q, (snapshot) => {
          const applicationsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setApplications(applicationsData);
        });
        return unsub;
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };
    fetchApplications();
  }, []);

  const filteredDrives = drives.filter(drive => {
    // First check if drive is expired
    const isExpired = driveAutoCompletionService.isDriveExpired(drive.driveDate);
    if (isExpired) {
      return false; // Don't show expired drives to students
    }
    
    // Then apply search filter
    const searchContent = `${drive.title || ''} ${drive.description || ''} ${drive.eligibility || ''} ${drive.company || ''}`.toLowerCase();
    return searchContent.includes(queryText.toLowerCase());
  });

  const handleApply = (drive: any) => {
    setSelectedDrive(drive);
    setOpenDialog(true);
  };

  const handleSubmitApplication = async () => {
    if (!auth.currentUser || !selectedDrive) return;

    // Check if drive is expired before allowing application
    const isExpired = driveAutoCompletionService.isDriveExpired(selectedDrive.driveDate);
    if (isExpired) {
      showToast('This drive has expired and applications are no longer accepted.', 'error');
      setOpenDialog(false);
      return;
    }

    try {
      await addDoc(collection(db, 'driveApplications'), {
        driveId: selectedDrive.id,
        userId: auth.currentUser.uid,
        coverLetter,
        resumeUploaded: resumeUploaded,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      const driveRef = doc(db, 'drives', selectedDrive.id);
      await updateDoc(driveRef, {
        currentApplications: (selectedDrive.currentApplications || 0) + 1,
        updatedAt: serverTimestamp()
      });

      setOpenDialog(false);
      setResumeFile(null);
      setCoverLetter('');
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      console.error('Error applying:', err);
      showToast('Failed to submit application. Please try again.', 'error');
    }
  };

  const hasApplied = (driveId: string) => {
    return applications.some(app => app.driveId === driveId);
  };

  const getApplicationStatus = (driveId: string) => {
    const application = applications.find(app => app.driveId === driveId);
    return application?.status || 'pending';
  };

  const handleResumeUpload = async (file: File) => {
    if (!auth.currentUser || !file) return;
    
    try {
      setUploadingResume(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            resumeData: base64String,
            resumeName: file.name,
            resumeUploaded: true,
            resumeType: file.type,
            resumeSize: file.size
          });
          
          setResumeUploaded(true);
          setCurrentResumeName(file.name);
          setResumeFile(null);
          showToast(`Resume "${file.name}" uploaded successfully!`, 'success');
        } catch (error) {
          console.error('Error saving resume:', error);
          showToast('Failed to upload resume. Please try again.', 'error');
        } finally {
          setUploadingResume(false);
        }
      };
      
      reader.onerror = () => {
        setUploadingResume(false);
        showToast('Failed to read file. Please try again.', 'error');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadingResume(false);
      showToast('Failed to upload resume. Please try again.', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      handleResumeUpload(file);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 3
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={3}
                position="relative"
                zIndex={1}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main', 
                    width: { xs: 56, sm: 72 }, 
                    height: { xs: 56, sm: 72 },
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}>
                    <WorkIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 800, 
                      mb: 1, 
                      fontSize: { xs: '1.75rem', sm: '2.5rem' } 
                    }}>
                      Student Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      opacity: 0.9, 
                      fontWeight: 400, 
                      fontSize: { xs: '0.875rem', sm: '1.25rem' } 
                    }}>
                      Placement Drives, Notices & Coding Progress
                    </Typography>
                  </Box>
                </Stack>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                  <TextField
                    size="medium"
                    placeholder="Search drives, companies, roles..."
                    value={queryText}
                    onChange={e => setQueryText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'white' }} />
                        </InputAdornment>
                      ),
                      sx: { 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 3,
                        color: 'white',
                        '&:before, &:after': { display: 'none' },
                        '& input::placeholder': { color: 'rgba(255, 255, 255, 0.7)' },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }
                    }}
                    sx={{ 
                      minWidth: { xs: '100%', sm: 320 },
                      '& .MuiInputBase-root': { color: 'white' }
                    }}
                  />
                  <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(_, v) => v && setView(v)}
                    size="medium"
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        border: 'none',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="cards">
                      <ViewModuleIcon sx={{ mr: 1, fontSize: 20 }} />
                      {!isMobile && 'Cards'}
                    </ToggleButton>
                    <ToggleButton value="table">
                      <ViewListIcon sx={{ mr: 1, fontSize: 20 }} />
                      {!isMobile && 'Table'}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Fade>

        

        {/* Main Content Grid */}
        <Grid container spacing={3} alignItems="flex-start">
          {/* Left Column - Placement Drives (2/3 width) */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Resume Upload */}
              <ResumeUploadSection
                resumeUploaded={resumeUploaded}
                uploadingResume={uploadingResume}
                onResumeUpload={handleResumeUpload}
                onFileSelect={handleFileSelect}
                currentResumeName={currentResumeName}
              />

              {/* Drive Stats */}
              <DriveStatsCards drives={filteredDrives} applications={applications} />

              {/* Drives Section */}
              <Slide direction="up" in={!loading} timeout={1000}>
                <Box>
                  {filteredDrives.length === 0 ? (
                    <Fade in timeout={600}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 4, sm: 6 },
                          textAlign: 'center',
                          borderRadius: 4,
                          background: 'white',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          No drives found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {queryText ? 'Try adjusting your search criteria.' : 'No placement drives are currently available. Check back later!'}
                        </Typography>
                      </Paper>
                    </Fade>
                  ) : view === 'cards' ? (
                    <Grid container spacing={3}>
                      {filteredDrives.map((drive, index) => (
                        <Grid 
                          key={drive.id} 
                          size={{ xs: 12, sm: 6 }}
                        >
                          <Slide direction="up" in timeout={800 + index * 100}>
                            <Box sx={{ height: '100%' }}>
                              <DriveCard 
                                drive={drive}
                                hasApplied={hasApplied}
                                getApplicationStatus={getApplicationStatus}
                                onApply={handleApply}
                                isMobile={isMobile}
                              />
                            </Box>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        borderRadius: 3, 
                        overflow: 'hidden',
                        background: 'white',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                Position
                              </TableCell>
                              {!isMobile && (
                                <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                  Company
                                </TableCell>
                              )}
                              {!isMobile && (
                                <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                  Date
                                </TableCell>
                              )}
                              {!isTablet && (
                                <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                  Eligibility
                                </TableCell>
                              )}
                              <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                Status
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, backgroundColor: 'grey.50', fontSize: '0.875rem' }}>
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredDrives.map((drive) => (
                              <TableRow
                                key={drive.id}
                                hover
                                sx={{
                                  transition: 'background-color 0.2s ease',
                                  '&:nth-of-type(even)': {
                                    backgroundColor: 'grey.50',
                                  },
                                  '&:hover': {
                                    backgroundColor: 'action.hover',
                                  },
                                }}
                              >
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, boxShadow: 1 }}>
                                      <WorkIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {drive.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                        {drive.description?.substring(0, 60)}...
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                {!isMobile && (
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {drive.company || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                )}
                                {!isMobile && (
                                  <TableCell>
                                    <Chip 
                                      label={new Date(drive.driveDate).toLocaleDateString()} 
                                      size="small" 
                                      variant="outlined" 
                                      sx={{ fontWeight: 500 }}
                                    />
                                  </TableCell>
                                )}
                                {!isTablet && (
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                      {drive.eligibility || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                )}
                                <TableCell>
                                  {hasApplied(drive.id) ? (
                                    <Chip
                                      label={getApplicationStatus(drive.id)}
                                      color={
                                        getApplicationStatus(drive.id) === 'accepted' ? 'success' :
                                        getApplicationStatus(drive.id) === 'rejected' ? 'error' : 'warning'
                                      }
                                      size="small"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  ) : (
                                    <Chip label="Not Applied" color="default" size="small" variant="outlined" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant={hasApplied(drive.id) ? "outlined" : "contained"}
                                    size="small" 
                                    onClick={() => handleApply(drive)}
                                    disabled={hasApplied(drive.id)}
                                    fullWidth={isMobile}
                                    sx={{ 
                                      minWidth: 100,
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      ...(hasApplied(drive.id) ? {
                                        borderColor: 'success.main',
                                        color: 'success.main',
                                      } : {
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                      })
                                    }}
                                  >
                                    {hasApplied(drive.id) ? 'Applied' : 'Apply'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}
                </Box>
              </Slide>
            </Stack>
          </Grid>

          {/* Right Column - Notices & Coding Dashboard (1/3 width) */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
              {/* Notices Section */}
              <NoticesSection notices={notices} />
              
              {/* Profile Management Section */}
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
                    <Typography variant="h6" sx={{
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <SecurityIcon color="primary" />
                      Profile Management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                      Manage your account settings and security
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
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
                      
                      <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        mt: 1
                      }}>
                        Keep your account secure with a strong password
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
  <Grid size={{ xs: 12 }}>
    <UnifiedCodingDashboard />
  </Grid>
</Grid>

        {/* Application Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          fullWidth 
          maxWidth="sm"
          fullScreen={isMobile}
          PaperProps={{
            sx: { 
              borderRadius: isMobile ? 0 : 4,
              background: 'white',
            }
          }}
        >
          <DialogTitle sx={{ 
            m: 0, 
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Apply for {selectedDrive?.title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpenDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {selectedDrive?.company && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedDrive.company}
                  </Typography>
                </Box>
              )}

              {!resumeUploaded && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Upload Resume
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ 
                      py: 2, 
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.light',
                        borderStyle: 'solid',
                      }
                    }}
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? 'Uploading...' : 'Choose Resume (PDF)'}
                    <input
                      type="file"
                      hidden
                      accept="application/pdf"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  {resumeFile && !uploadingResume && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      Selected: {resumeFile.name}
                    </Alert>
                  )}
                </Box>
              )}
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Cover Letter {!resumeUploaded && '(Optional)'}
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Write a brief cover letter or any additional notes for your application..."
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication} 
              variant="contained"
              disabled={!resumeUploaded}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Submit Application
            </Button>
          </DialogActions>
        </Dialog>

        {/* Password Change Dialog */}
        <PasswordChangeDialog
          open={passwordChangeOpen}
          onClose={() => setPasswordChangeOpen(false)}
          user={user}
        />

        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={handleToastClose}
            severity={toastSeverity}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}