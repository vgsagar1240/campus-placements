import React, { useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import driveAutoCompletionService from '../services/driveAutoCompletionService';
import { 
  Box, 
  Button,  
  Stack, 
  TextField, 
  Typography,  
  Avatar,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Fade,
  Slide,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Badge,
  CircularProgress
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Work as WorkIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarMonthIcon,
  School as SchoolIcon,

} from '@mui/icons-material';

interface Drive {
  id: string;
  title: string;
  description: string;
  driveDate: string;
  eligibility: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  maxApplications?: number;
  currentApplications?: number;
  createdAt: string;
  updatedAt: string;
}


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`drive-tabpanel-${index}`}
      aria-labelledby={`drive-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DriveCreate() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Drive | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    driveDate: '',
    eligibility: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    maxApplications: 100
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalApplications: 0
  });

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        // First, check and complete any expired drives
        const autoCompletionResult = await driveAutoCompletionService.checkAndCompleteExpiredDrives();
        if (autoCompletionResult.completed > 0) {
          console.log(`Auto-completed ${autoCompletionResult.completed} expired drives`);
          if (autoCompletionResult.errors.length > 0) {
            console.warn('Errors during auto-completion:', autoCompletionResult.errors);
          }
        }
        
        // Then fetch all drives
        const q = query(collection(db, 'drives'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
          const drivesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Drive[];
          setDrives(drivesData);
          calculateStats(drivesData);
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

  const calculateStats = (drivesData: Drive[]) => {
    const stats = {
      total: drivesData.length,
      active: drivesData.filter(d => d.status === 'active').length,
      completed: drivesData.filter(d => d.status === 'completed').length,
      draft: drivesData.filter(d => d.status === 'draft').length,
      totalApplications: drivesData.reduce((sum, drive) => sum + (drive.currentApplications || 0), 0)
    };
    setStats(stats);
  };

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      driveDate: '',
      eligibility: '',
      status: 'draft',
      maxApplications: 100
    });
    setEditing(null);
  };

  const handleCreateDrive = async () => {
    if (!formData.title.trim() || !formData.driveDate) {
      setSnackbar({ open: true, message: 'Title and date are required', severity: 'warning' });
      return;
    }

    try {
      setCreating(true);
      
      const formattedDate = new Date(formData.driveDate).toISOString();
      
      const driveData = {
        ...formData,
        driveDate: formattedDate,
        currentApplications: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editing) {
        // Only update specific fields that we know exist and are valid
        const updateData: any = {
          title: formData.title || '',
          description: formData.description || '',
          driveDate: formattedDate,
          eligibility: formData.eligibility || '',
          status: formData.status || 'draft',
          updatedAt: new Date().toISOString()
        };
        if (formData.maxApplications && formData.maxApplications > 0) {
          updateData.maxApplications = formData.maxApplications;
        }
        
        // Clean data before sending to Firestore
        const finalUpdateData = cleanDataForFirestore(updateData);
        
        // Debug logging
        console.log('Updating drive with data:', finalUpdateData);
        console.log('Drive ID:', editing.id);
        
        await updateDoc(doc(db, 'drives', editing.id), finalUpdateData);
        setSnackbar({ open: true, message: 'Drive updated successfully!', severity: 'success' });
      } else {
        await addDoc(collection(db, 'drives'), driveData);
        setSnackbar({ open: true, message: 'Drive created successfully!', severity: 'success' });
      }

      setOpenDialog(false);
      resetForm();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to save drive', severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (drive: Drive) => {
    setEditing(drive);
    setFormData({
      title: drive.title,
      description: drive.description,
      driveDate: formatDateForInput(drive.driveDate),
      eligibility: drive.eligibility,
      status: drive.status,
      maxApplications: drive.maxApplications || 100
    });
    setOpenDialog(true);
  };

  const handleDelete = async (driveId: string) => {
    if (!window.confirm('Are you sure you want to delete this drive? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'drives', driveId));
      setSnackbar({ open: true, message: 'Drive deleted successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to delete drive', severity: 'error' });
    }
  };

  const handleStatusChange = async (driveId: string, newStatus: string) => {
    if (!newStatus || !driveId) {
      setSnackbar({ open: true, message: 'Invalid status or drive ID', severity: 'error' });
      return;
    }
    
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Clean data before sending to Firestore
      const finalUpdateData = cleanDataForFirestore(updateData);
      
      // Debug logging
      console.log('Updating drive status with data:', finalUpdateData);
      console.log('Drive ID:', driveId);
      
      await updateDoc(doc(db, 'drives', driveId), finalUpdateData);
      setSnackbar({ open: true, message: 'Drive status updated!', severity: 'success' });
    } catch (error: any) {
      console.error('Error updating drive status:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to update status', severity: 'error' });
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper function to clean up data before sending to Firestore
  const cleanDataForFirestore = (data: any) => {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'completed': return <ScheduleIcon />;
      case 'cancelled': return <WarningIcon />;
      default: return <WorkIcon />;
    }
  };

  const getFilteredDrives = () => {
    switch (tabValue) {
      case 0: return drives; // All
      case 1: return drives.filter(d => d.status === 'active');
      case 2: return drives.filter(d => d.status === 'draft');
      case 3: return drives.filter(d => d.status === 'completed');
      default: return drives;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDaysUntilDrive = (driveDate: string) => {
    const today = new Date();
    const drive = new Date(driveDate);
    const diffTime = drive.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Drive Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage placement drives for students
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            size={isMobile ? "medium" : "large"}
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Create Drive
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Drives', value: stats.total, icon: <WorkIcon />, color: '#1976d2' },
          { label: 'Active Drives', value: stats.active, icon: <TrendingUpIcon />, color: '#2e7d32' },
          { label: 'Draft Drives', value: stats.draft, icon: <ScheduleIcon />, color: '#ed6c02' },
          { label: 'Total Applications', value: stats.totalApplications, icon: <PeopleIcon />, color: '#9c27b0' }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Slide direction="up" in timeout={800 + index * 200}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  background: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${stat.color}15`,
                        color: stat.color,
                        width: 48,
                        height: 48
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Section */}
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: 'white'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  py: 2,
                  minHeight: 'auto'
                }
              }}
            >
              <Tab 
                icon={<WorkIcon />} 
                iconPosition="start" 
                label={`All Drives (${stats.total})`} 
              />
              <Tab 
                icon={<TrendingUpIcon />} 
                iconPosition="start" 
                label={
                  <Badge badgeContent={stats.active} color="success" showZero>
                    <Box sx={{ px: 1 }}>Active</Box>
                  </Badge>
                } 
              />
              <Tab 
                icon={<ScheduleIcon />} 
                iconPosition="start" 
                label={
                  <Badge badgeContent={stats.draft} color="warning" showZero>
                    <Box sx={{ px: 1 }}>Draft</Box>
                  </Badge>
                } 
              />
              <Tab 
                icon={<CheckCircleIcon />} 
                iconPosition="start" 
                label={`Completed (${stats.completed})`} 
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <DriveGrid 
              drives={getFilteredDrives()} 
              loading={loading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              formatDateForDisplay={formatDateForDisplay}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getDaysUntilDrive={getDaysUntilDrive}
              isMobile={isMobile}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <DriveGrid 
              drives={getFilteredDrives()} 
              loading={loading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              formatDateForDisplay={formatDateForDisplay}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getDaysUntilDrive={getDaysUntilDrive}
              isMobile={isMobile}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <DriveGrid 
              drives={getFilteredDrives()} 
              loading={loading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              formatDateForDisplay={formatDateForDisplay}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getDaysUntilDrive={getDaysUntilDrive}
              isMobile={isMobile}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <DriveGrid 
              drives={getFilteredDrives()} 
              loading={loading} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              formatDateForDisplay={formatDateForDisplay}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getDaysUntilDrive={getDaysUntilDrive}
              isMobile={isMobile}
            />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <DriveDialog
        open={openDialog}
        editing={editing}
        formData={formData}
        creating={creating}
        onInputChange={handleInputChange}
        onCreateDrive={handleCreateDrive}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        isMobile={isMobile}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Separate Drive Grid Component for better organization
interface DriveGridProps {
  drives: Drive[];
  loading: boolean;
  onEdit: (drive: Drive) => void;
  onDelete: (driveId: string) => void;
  onStatusChange: (driveId: string, newStatus: string) => void;
  formatDateForDisplay: (date: string) => string;
  getStatusColor: (status: string) => "success" | "info" | "error" | "warning" | "default";
  getStatusIcon: (status: string) => React.ReactElement;
  getDaysUntilDrive: (date: string) => number;
  isMobile: boolean;
}

const DriveGrid: React.FC<DriveGridProps> = ({
  drives,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  formatDateForDisplay,
  getStatusColor,
  getStatusIcon,
  getDaysUntilDrive,
  isMobile
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (drives.length === 0) {
    return (
      <Fade in timeout={600}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No drives found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first drive to get started
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
        <Grid container spacing={2}>
      {drives.map((drive, index) => (
        <Grid item xs={12} sm={6} md={4} key={drive.id}>
          <Slide direction="up" in timeout={800 + index * 100}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: `1px solid blue`,
                background: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3, flex: 1 }}>
                {/* Header */}
                <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <WorkIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {drive.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={drive.status}
                        color={getStatusColor(drive.status)}
                        size="small"
                        icon={getStatusIcon(drive.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {drive.description}
                </Typography>

                {/* Details */}
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateForDisplay(drive.driveDate)}
                    </Typography>
                    {drive.status === 'active' && (
                      <Chip
                        label={`${getDaysUntilDrive(drive.driveDate)} days`}
                        size="small"
                        color={getDaysUntilDrive(drive.driveDate) <= 7 ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {drive.currentApplications || 0} / {drive.maxApplications || 100} applications
                    </Typography>
                  </Stack>

                  {drive.eligibility && (
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {drive.eligibility}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ width: '100%' }}>
                  <Tooltip title="Edit drive">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(drive)}
                      variant="outlined"
                      fullWidth={isMobile}
                      sx={{ borderRadius: 2 }}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete drive">
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDelete(drive.id)}
                      variant="outlined"
                      color="error"
                      fullWidth={isMobile}
                      sx={{ borderRadius: 2 }}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </Stack>
              </CardActions>
            </Card>
          </Slide>
        </Grid>
      ))}
    </Grid>
  );
};

// Separate Dialog Component
interface DriveDialogProps {
  open: boolean;
  editing: Drive | null;
  formData: any;
  creating: boolean;
  onInputChange: (field: string) => (event: any) => void;
  onCreateDrive: () => void;
  onClose: () => void;
  isMobile: boolean;
}

const DriveDialog: React.FC<DriveDialogProps> = ({
  open,
  editing,
  formData,
  creating,
  onInputChange,
  onCreateDrive,
  onClose,
  isMobile
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { 
          borderRadius: 3,
          m: isMobile ? 1 : 2
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 3
      }}>
        <WorkIcon />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editing ? 'Edit Drive' : 'Create New Drive'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Drive Title"
              value={formData.title}
              onChange={onInputChange('title')}
              fullWidth
              required
              placeholder="e.g., Google Summer Internship 2024"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Drive Date"
              type="date"
              value={formData.driveDate}
              onChange={onInputChange('driveDate')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={onInputChange('description')}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the drive, roles, and opportunities..."
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Eligibility Criteria"
              value={formData.eligibility}
              onChange={onInputChange('eligibility')}
              fullWidth
              placeholder="e.g., CGPA >= 7.0, CSE/IT branches only"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Maximum Applications"
              type="number"
              value={formData.maxApplications}
              onChange={onInputChange('maxApplications')}
              fullWidth
              InputProps={{
                sx: { borderRadius: 2 },
                inputProps: { min: 1 }
              }}
            />
          </Grid>
          
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={onInputChange('status')}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: isMobile ? 2 : 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={creating}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Cancel
          </Button>
        <Button
          variant="contained"
          onClick={onCreateDrive}
          disabled={creating || !formData.title.trim() || !formData.driveDate}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
            px: 3
          }}
        >
          {creating ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              {editing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            editing ? 'Update Drive' : 'Create Drive'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};