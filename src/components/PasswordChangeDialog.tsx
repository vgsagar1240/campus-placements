import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Slide
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getAuthErrorMessage } from '../utils/authErrorHandler';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({ open, onClose, user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password strength validation
  const validatePasswordStrength = (password: string) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('at least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('one special character');
    }
    return errors;
  };

  // Simple password verification (for common cases)
  const isPasswordLikelyIncorrect = (password: string) => {
    // Common patterns that are likely incorrect
    const commonPatterns = [
      /^123456/,  // Sequential numbers
      /^password/i,  // Common passwords
      /^qwerty/i,
      /^admin/i,
      /^test/i,
      /^\d{6,}$/,  // Only numbers
      /^[a-z]{6,}$/,  // Only lowercase
      /^[A-Z]{6,}$/,  // Only uppercase
    ];
    
    return commonPatterns.some(pattern => pattern.test(password));
  };

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'currentPassword':
        if (!value) {
          errors.currentPassword = 'Current password is required';
        } else {
          errors.currentPassword = '';
        }
        break;
        
      case 'newPassword':
        if (!value) {
          errors.newPassword = 'New password is required';
        } else if (value.length < 6) {
          errors.newPassword = 'Password must be at least 6 characters long';
        } else if (value === currentPassword) {
          errors.newPassword = 'New password must be different from current password';
        } else {
          const strengthErrors = validatePasswordStrength(value);
          if (strengthErrors.length > 0) {
            errors.newPassword = `Password should include ${strengthErrors.join(', ')}`;
          } else {
            errors.newPassword = '';
          }
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your new password';
        } else if (value !== newPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          errors.confirmPassword = '';
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setValidationErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    // Validate user object
    if (!user || !user.email) {
      setError('User session is invalid. Please log in again.');
      return;
    }

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Check for common password patterns that are likely incorrect
    if (isPasswordLikelyIncorrect(currentPassword)) {
      setError('The current password appears to be a common pattern. Please verify you entered the correct password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    // Check password strength
    const strengthErrors = validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
      setError(`Password is too weak. Please include ${strengthErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user with more specific error handling
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess('Password changed successfully! You will be logged out for security reasons.');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      // Handle Firebase errors silently and show user-friendly messages
      if (err.code === 'auth/wrong-password' || 
          err.code === 'auth/invalid-credential' || 
          err.code === 'auth/invalid-login-credentials') {
        setError('Current password is incorrect. Please check and try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log in again before changing your password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('An error occurred while changing your password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
      TransitionComponent={Slide}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 2,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          Change Password
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Update your account password for better security
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 , mt: 2}}>
          {/* Current Password */}
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={e => {
              setCurrentPassword(e.target.value);
              validateField('currentPassword', e.target.value);
            }}
            fullWidth
            error={!!validationErrors.currentPassword}
            helperText={validationErrors.currentPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    size="small"
                  >
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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

          {/* New Password */}
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={e => {
              setNewPassword(e.target.value);
              validateField('newPassword', e.target.value);
            }}
            fullWidth
            error={!!validationErrors.newPassword}
            helperText={validationErrors.newPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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

          {/* Confirm New Password */}
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value);
              validateField('confirmPassword', e.target.value);
            }}
            fullWidth
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {success}
            </Alert>
          )}


          {/* Password Requirements */}
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Password Requirements:
            </Typography>
            <Typography variant="body2" component="div">
              • At least 6 characters long<br/>
              • Must be different from current password<br/>
              • Include uppercase and lowercase letters<br/>
              • Include at least one number<br/>
              • Include at least one special character (!@#$%^&*)
            </Typography>
          </Alert>

          

          
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePasswordChange}
          variant="contained"
          disabled={
            loading || 
            !currentPassword || 
            !newPassword || 
            !confirmPassword ||
            currentPassword === newPassword ||
            newPassword !== confirmPassword ||
            newPassword.length < 6
          }
          startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
          
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;
