import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Warning as WarningIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

interface InactivityWarningDialogProps {
  open: boolean;
  timeRemaining: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const InactivityWarningDialog: React.FC<InactivityWarningDialogProps> = ({
  open,
  timeRemaining,
  onStayLoggedIn,
  onLogout
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (open && timeRemaining > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, timeRemaining, onLogout]);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (countdown / timeRemaining) * 100;

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      disableBackdropClick
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0,0,0,0.05)'
        }
      }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        pb: 2,
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          Session Timeout Warning
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          You will be automatically logged out due to inactivity
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <TimerIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
            {formatTime(countdown)}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Your session will expire in the time shown above
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#f59e0b',
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            For security reasons, you will be automatically logged out after 30 minutes of inactivity. 
            Click "Stay Logged In" to continue your session.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onLogout}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Logout Now
        </Button>
        <Button
          onClick={onStayLoggedIn}
          variant="contained"
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            }
          }}
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InactivityWarningDialog;
