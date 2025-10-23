// pages/login.tsx

import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Fade,
  Slide,
  Alert,
  Snackbar,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuthErrorMessage } from '../src/utils/authErrorHandler';
import { db, auth } from '../src/firebase/firebase';

export default function LoginPage() {
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [currentInviteCode, setCurrentInviteCode] = React.useState('EMPLOYEE2025');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = React.useState(false);
  const [inviteCodeStatus, setInviteCodeStatus] = React.useState<'valid' | 'invalid' | 'empty'>('empty');
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load current invite code from database
  React.useEffect(() => {
    const loadCurrentInviteCode = async () => {
      try {
        const inviteCodeRef = doc(db, 'settings', 'inviteCode');
        const inviteCodeDoc = await getDoc(inviteCodeRef);
        
        if (inviteCodeDoc.exists()) {
          const data = inviteCodeDoc.data();
          setCurrentInviteCode(data.code || 'EMPLOYEE2025');
        }
      } catch (error) {
        console.error('Error loading invite code:', error);
        // Keep default value if loading fails
      }
    };

    loadCurrentInviteCode();
  }, []);

  const validateEmailDomain = (email: string) => {
    return email.endsWith('@mvgrce.edu.in');
  };

  const validateStudentId = (email: string) => {
    // Extract student ID from email (e.g., 23331A0761@mvgrce.edu.in or 23sagar@mvgrce.edu.in)
    const studentId = email.split('@')[0];
    console.log('Validating student ID:', studentId, 'Length:', studentId.length);
    
    // For shorter IDs like "23sagar", check if it starts with year digits
    if (studentId.length < 10) {
      // Check if it starts with 2 digits (year)
      const yearMatch = studentId.match(/^(\d{2})/);
      if (!yearMatch) return false;
      
      const yearDigits = parseInt(yearMatch[1]);
      const admissionYear = 2000 + yearDigits; // Convert 23 to 2023
      const currentYear = new Date().getFullYear();
      
      console.log('Short ID validation - Year digits:', yearDigits, 'Admission year:', admissionYear, 'Current year:', currentYear);
      
      // Check if student is within 4 years of admission
      const yearsSinceAdmission = currentYear - admissionYear;
      const isValid = yearsSinceAdmission >= 0 && yearsSinceAdmission <= 4;
      console.log('Years since admission:', yearsSinceAdmission, 'Valid:', isValid);
      return isValid;
    }
    
    // For longer IDs, use the original logic
    const yearDigits = parseInt(studentId.substring(0, 2));
    const admissionYear = 2000 + yearDigits; // Convert 23 to 2023
    const currentYear = new Date().getFullYear();
    
    console.log('Long ID validation - Year digits:', yearDigits, 'Admission year:', admissionYear, 'Current year:', currentYear);
    
    // Check if student is within 4 years of admission
    const yearsSinceAdmission = currentYear - admissionYear;
    const isValid = yearsSinceAdmission >= 0 && yearsSinceAdmission <= 4;
    console.log('Years since admission:', yearsSinceAdmission, 'Valid:', isValid);
    return isValid;
  };

  const handleInviteCodeChange = (value: string) => {
    setInviteCode(value);
    
    if (value === '') {
      setInviteCodeStatus('empty');
    } else if (value === currentInviteCode) {
      setInviteCodeStatus('valid');
    } else {
      setInviteCodeStatus('invalid');
    }
  };

  const register = async () => {
    setError('');
    setLoading(true);
    
    // Validate email domain
    if (!validateEmailDomain(email)) {
      setError('Only @mvgrce.edu.in email addresses are allowed');
      setSnackbar({ open: true, message: 'Only @mvgrce.edu.in email addresses are allowed', severity: 'error' });
      setLoading(false);
      return;
    }

    let role = 'student';
    
    if (inviteCode && inviteCode !== currentInviteCode) {
      // Wrong invite code entered
      setSnackbar({ open: true, message: 'Invalid invite code entered. You will be registered as a student.', severity: 'warning' });
    } else if (inviteCode === currentInviteCode) {
      // Correct invite code
      role = 'employee';
    }
    
    // For students, validate student ID expiry
    if (role === 'student') {
      if (!validateStudentId(email)) {
        setError('Student ID has expired. Please contact administration if you believe this is an error.');
        setSnackbar({ open: true, message: 'Student ID has expired. Please contact administration if you believe this is an error.', severity: 'error' });
        setLoading(false);
        return;
      }
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        const userData = { 
          name, 
          email, 
          role,
          studentId: email.split('@')[0],
          admissionYear: parseInt(email.split('@')[0].substring(0, 2)) + 2000,
          createdAt: new Date().toISOString()
        };
        
        console.log('Saving user data:', userData); // Debug log
        await setDoc(doc(db, 'users', cred.user.uid), userData);
        
        setSnackbar({ open: true, message: 'Account created successfully!', severity: 'success' });
        
        // Reload the page to ensure AuthContext properly loads the role
        setTimeout(() => {
          console.log('Reloading page to ensure proper role loading...'); // Debug log
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err: any) {
      const userFriendlyMessage = getAuthErrorMessage(err);
      setError(userFriendlyMessage);
      setSnackbar({ open: true, message: userFriendlyMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setError('');
    setLoading(true);
    
    // Validate email domain
    if (!validateEmailDomain(email)) {
      setError('Only @mvgrce.edu.in email addresses are allowed');
      setSnackbar({ open: true, message: 'Only @mvgrce.edu.in email addresses are allowed', severity: 'error' });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSnackbar({ open: true, message: 'Welcome back!', severity: 'success' });
      setTimeout(() => {
        console.log('Reloading page after login...'); // Debug log
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err: any) {
      const userFriendlyMessage = getAuthErrorMessage(err);
      setError(userFriendlyMessage);
      setSnackbar({ open: true, message: userFriendlyMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setSnackbar({ 
        open: true, 
        message: 'Please enter your email address', 
        severity: 'error' 
      });
      return;
    }

    if (!validateEmailDomain(forgotPasswordEmail)) {
      setSnackbar({ 
        open: true, 
        message: 'Only @mvgrce.edu.in email addresses are allowed', 
        severity: 'error' 
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setSnackbar({ 
        open: true, 
        message: 'Password reset email sent! Please check your inbox.', 
        severity: 'success' 
      });
      setForgotPasswordOpen(false);
      setForgotPasswordEmail('');
    } catch (err: any) {
      const userFriendlyMessage = getAuthErrorMessage(err);
      setSnackbar({ 
        open: true, 
        message: userFriendlyMessage, 
        severity: 'error' 
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 2
      }}
    >
      <Fade in timeout={800}>
        <Card
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30, 58, 138, 0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                p: 4,
                pb: 2,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Campus Placements
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
                {isRegister ? 'Join our placement platform' : 'Welcome back to your dashboard'}
              </Typography>

              <Tabs
                value={isRegister ? 1 : 0}
                onChange={(_, v) => setIsRegister(v === 1)}
                centered
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem'
                  },
                  '& .Mui-selected': {
                    color: '#ffffff !important'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#ffffff',
                    height: 3,
                    borderRadius: 2
                  }
                }}
              >
                <Tab label="Login" icon={<LoginIcon />} iconPosition="start" />
                <Tab label="Register" icon={<PersonAddIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              <Slide direction="up" in timeout={1000}>
                <Stack spacing={3}>
                  {isRegister && (
                    <TextField
                      label="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          register();
                        }
                      }}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#1e3a8a' }
                        }
                      }}
                    />
                  )}

                  <TextField
                    label="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        isRegister ? register() : login();
                      }
                    }}
                    fullWidth
                    type="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#3b82f6' },
                        '&.Mui-focused fieldset': { borderColor: '#1e3a8a' }
                      }
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        isRegister ? register() : login();
                      }
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#3b82f6' },
                        '&.Mui-focused fieldset': { borderColor: '#1e3a8a' }
                      }
                    }}
                  />

                  {!isRegister && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setForgotPasswordOpen(true)}
                        startIcon={<LockResetIcon />}
                        sx={{
                          color: 'primary.main',
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 58, 138, 0.04)'
                          }
                        }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>
                  )}

                  {isRegister && (
                    <TextField
                      label="Employee Invite Code (optional)"
                      value={inviteCode}
                      onChange={e => handleInviteCodeChange(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          register();
                        }
                      }}
                      fullWidth
                      placeholder={`Enter invite code for admin access`}
                      error={inviteCodeStatus === 'invalid'}
                      helperText={
                        inviteCodeStatus === 'valid' 
                          ? 'Valid invite code - You will be registered as an employee' 
                          : inviteCodeStatus === 'invalid' 
                          ? 'Invalid invite code - You will be registered as a student'
                          : ''
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SecurityIcon color={inviteCodeStatus === 'valid' ? 'success' : inviteCodeStatus === 'invalid' ? 'error' : 'primary'} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#3b82f6' },
                          '&.Mui-focused fieldset': { borderColor: '#1e3a8a' }
                        }
                      }}
                    />
                  )}

                  {isRegister && inviteCodeStatus === 'invalid' && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2">
                        <strong>Invalid invite code entered!</strong> You will be registered as a student. 
                        If you need employee access, please contact administration for the correct invite code.
                      </Typography>
                    </Alert>
                  )}

                  {isRegister && inviteCodeStatus === 'valid' && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2">
                        <strong>Valid invite code!</strong> You will be registered as an employee with admin access.
                      </Typography>
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !email || !password || (isRegister && !name)}
                    onClick={isRegister ? register : login}
                    startIcon={isRegister ? <PersonAddIcon /> : <LoginIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1e40af 30%, #2563eb 90%)'
                      },
                      '&:disabled': {
                        background: 'rgba(0,0,0,0.12)',
                        color: 'rgba(0,0,0,0.26)'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : isRegister ? 'Create Account' : 'Sign In'}
                  </Button>

                  {isRegister && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Divider sx={{ mb: 2 }}>
                        <Chip label="Role Selection" size="small" />
                      </Divider>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Chip
                          icon={<SchoolIcon />}
                          label="Student"
                          color={inviteCodeStatus === 'empty' || inviteCodeStatus === 'invalid' ? 'primary' : 'default'}
                          variant={inviteCodeStatus === 'empty' || inviteCodeStatus === 'invalid' ? 'filled' : 'outlined'}
                        />
                        <Chip
                          icon={<WorkIcon />}
                          label="Employee"
                          color={inviteCodeStatus === 'valid' ? 'secondary' : 'default'}
                          variant={inviteCodeStatus === 'valid' ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Slide>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(30, 58, 138, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <LockResetIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Enter your email address to receive password reset instructions
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <TextField
            label="Email Address"
            type="email"
            value={forgotPasswordEmail}
            onChange={e => setForgotPasswordEmail(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleForgotPassword();
              }
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3, mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#1e3a8a' }
              }
            }}
          />
          
          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
            <Typography variant="body2">
              We'll send you a link to reset your password. Make sure to use your @mvgrce.edu.in email address.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setForgotPasswordOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotPasswordLoading || !forgotPasswordEmail}
            startIcon={forgotPasswordLoading ? <CircularProgress size={20} /> : <LockResetIcon />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
              }
            }}
          >
            {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
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
}
