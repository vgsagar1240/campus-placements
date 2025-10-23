import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs,  doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Applicant {
  id: string;
  driveId: string;
  userId: string;
  userName: string;
  userEmail: string;
  coverLetter: string;
  resumeUploaded: boolean;
  resumeUrl?: string;
  resumeName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  driveTitle?: string;
}

interface Drive {
  id: string;
  title: string;
  status: string;
}

export default function ApplicantsList() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState<{ url: string; name: string } | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drives
        const drivesQuery = query(collection(db, 'drives'));
        const drivesSnapshot = await getDocs(drivesQuery);
        const drivesData = drivesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Drive[];
        setDrives(drivesData);

        // Fetch applications with user data
        const applicationsQuery = query(collection(db, 'driveApplications'));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        
        const applicationsData = await Promise.all(
          applicationsSnapshot.docs.map(async (doc) => {
            const appData = doc.data();
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', appData.userId)));
            const userData = userDoc.docs[0]?.data();
            const drive = drivesData.find(d => d.id === appData.driveId);
            
            return {
              id: doc.id,
              driveId: appData.driveId,
              userId: appData.userId,
              userName: userData?.name || 'Unknown User',
              userEmail: userData?.email || 'No email',
              coverLetter: appData.coverLetter || '',
              resumeUploaded: appData.resumeUploaded || false,
              resumeUrl: userData?.resumeData || '',
              resumeName: userData?.resumeName || '',
              status: appData.status || 'pending',
              createdAt: appData.createdAt,
              driveTitle: drive?.title || 'Unknown Drive'
            };
          })
        );
        
        setApplicants(applicationsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredApplicants = selectedDrive === 'all' 
    ? applicants 
    : applicants.filter(app => app.driveId === selectedDrive);

  const handleStatusChange = async (applicantId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const applicant = applicants.find(app => app.id === applicantId);
      if (!applicant) return;

      // Update application status
      await updateDoc(doc(db, 'driveApplications', applicantId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update drive's currentApplications count
      const driveRef = doc(db, 'drives', applicant.driveId);
      const currentDrive = drives.find(d => d.id === applicant.driveId);
      if (currentDrive) {
        // Count current pending applications for this drive
      const pendingCount = applicants.filter(app => {
  const isPending = app.id === applicantId
    ? false // or whatever logic applies when updating this applicant
    : app.status === 'pending';
  return app.driveId === applicant.driveId && isPending;
}).length;
        
        await updateDoc(driveRef, {
          currentApplications: pendingCount,
          updatedAt: serverTimestamp()
        });
      }
      
      setSnackbar({ 
        open: true, 
        message: `Application ${newStatus} successfully!`, 
        severity: 'success' 
      });
      
      // Update local state
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicantId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update application status', 
        severity: 'error' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <VisibilityIcon />;
    }
  };

  const handleViewResume = (applicant: Applicant) => {
    if (applicant.resumeUrl) {
      setSelectedResume({
        url: applicant.resumeUrl,
        name: applicant.resumeName || 'Resume'
      });
      setOpenResumeDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: 'No resume available for this applicant',
        severity: 'warning'
      });
    }
  };

  const handleDownloadResume = (url: string, name: string) => {
    try {
      const link = document.createElement('a');
      
      if (url.startsWith('data:')) {
        // Handle base64 data
        link.href = url;
        link.download = name;
      } else {
        // Handle regular URLs
        link.href = url;
        link.download = name;
        link.target = '_blank';
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download resume',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Student Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and review student applications for placement drives
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Drive</InputLabel>
                <Select
                  value={selectedDrive}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                  label="Filter by Drive"
                >
                  <MenuItem value="all">All Drives</MenuItem>
                  {drives.map((drive) => (
                    <MenuItem key={drive.id} value={drive.id}>
                      {drive.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Drive</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Resume</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplicants.map((applicant) => (
                  <TableRow key={applicant.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {applicant.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {applicant.userName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {applicant.userEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {applicant.driveTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={applicant.status}
                        color={getStatusColor(applicant.status)}
                        size="small"
                        icon={getStatusIcon(applicant.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={applicant.resumeUploaded ? 'Uploaded' : 'Not Uploaded'}
                        color={applicant.resumeUploaded ? 'success' : 'default'}
                        size="small"
                        variant={applicant.resumeUploaded ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {applicant.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setOpenDialog(true);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {applicant.resumeUploaded && (
                          <Tooltip title="View Resume">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewResume(applicant)}
                            >
                              <PictureAsPdfIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {applicant.status === 'pending' && (
                          <>
                            <Tooltip title="Accept">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatusChange(applicant.id, 'accepted')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStatusChange(applicant.id, 'rejected')}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredApplicants.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDrive === 'all' 
                  ? 'No students have applied for any drives yet.'
                  : 'No students have applied for this drive yet.'
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Application Details
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedApplicant && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" />
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedApplicant.userName}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailIcon color="primary" />
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedApplicant.userEmail}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkIcon color="primary" />
                      <Typography variant="body2">
                        <strong>Drive:</strong> {selectedApplicant.driveTitle}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body2">
                        <strong>Status:</strong> 
                        <Chip 
                          label={selectedApplicant.status} 
                          color={getStatusColor(selectedApplicant.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cover Letter
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {selectedApplicant.coverLetter || 'No cover letter provided'}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Resume Status
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={selectedApplicant.resumeUploaded ? 'Resume Uploaded' : 'No Resume Uploaded'}
                    color={selectedApplicant.resumeUploaded ? 'success' : 'warning'}
                    variant={selectedApplicant.resumeUploaded ? 'filled' : 'outlined'}
                  />
                  {selectedApplicant.resumeUploaded && selectedApplicant.resumeUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleViewResume(selectedApplicant)}
                      size="small"
                    >
                      View Resume
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Close
          </Button>
          {selectedApplicant?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleStatusChange(selectedApplicant.id, 'rejected')}
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedApplicant.id, 'accepted')}
                color="success"
                variant="contained"
              >
                Accept
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Resume View Dialog */}
      <Dialog
        open={openResumeDialog}
        onClose={() => setOpenResumeDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PictureAsPdfIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Resume Viewer
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {selectedResume && (
              <Tooltip title="Download Resume">
                <IconButton
                  onClick={() => handleDownloadResume(selectedResume.url, selectedResume.name)}
                  sx={{ color: 'white' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => setOpenResumeDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh' }}>
          {selectedResume && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedResume.name}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {selectedResume.url.startsWith('data:') ? (
                  <iframe
                    src={selectedResume.url}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title="Resume Viewer"
                  />
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      Resume Preview Not Available
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadResume(selectedResume.url, selectedResume.name)}
                    >
                      Download Resume
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
