import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  Avatar,

} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Close as CloseIcon,

  Sync as SyncIcon,

  Check as CheckIcon,

} from '@mui/icons-material';
import { profileSyncService, PlatformProfile } from '../services/profileSyncService';
import { useAuth } from '../contexts/AuthContext';

interface ProfileManagementProps {
  open: boolean;
  onClose: () => void;
  onProfilesUpdated: (profiles: PlatformProfile[]) => void;
}

export default function ProfileManagement({ open, onClose, onProfilesUpdated }: ProfileManagementProps) {
  const { user } = useAuth();
  const [usernames, setUsernames] = useState({
    leetcode: '',
    hackerrank: '',
    codechef: ''
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [existingProfiles, setExistingProfiles] = useState<PlatformProfile[]>([]);

  const loadExistingProfiles = useCallback(async () => {
    if (!user) return;
    
    try {
      const profiles = await profileSyncService.getUserProfiles(user.uid);
      setExistingProfiles(profiles);
      
      // Pre-fill usernames from existing profiles
      const usernameMap = {
        leetcode: '',
        hackerrank: '',
        codechef: ''
      };
      
      profiles.forEach(profile => {
        usernameMap[profile.platform] = profile.username;
      });
      
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error loading existing profiles:', error);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      loadExistingProfiles();
    }
  }, [open, user, loadExistingProfiles]);

  const handleUsernameChange = (platform: string, value: string) => {
    setUsernames(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSyncPlatform = async (platform: string) => {
    if (!user) return;
    
    const username = usernames[platform as keyof typeof usernames];
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Please enter a username for this platform' });
      return;
    }

    setSyncing(platform);
    setMessage(null);

    try {
      const result = await profileSyncService.syncPlatformProfile(user.uid, platform, username);
      
      if (result.success) {
        setMessage({ type: 'success', text: `${platform} profile synced successfully!` });
        await loadExistingProfiles();
        onProfilesUpdated(existingProfiles);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to sync profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while syncing' });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    if (!user) return;
    
    const validUsernames = Object.entries(usernames).filter(([_, username]) => username.trim() !== '');
    
    if (validUsernames.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one username' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const results = await profileSyncService.syncAllProfiles(user.uid, usernames);
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        setMessage({ 
          type: 'success', 
          text: `Successfully synced ${successCount} profile(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}` 
        });
        await loadExistingProfiles();
        onProfilesUpdated(existingProfiles);
      } else {
        setMessage({ type: 'error', text: 'Failed to sync any profiles' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while syncing profiles' });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms = {
      leetcode: {
        name: 'LeetCode',
        color: '#ffa116',
        icon: '🧮',
        description: 'Master coding interviews with LeetCode problems'
      },
      hackerrank: {
        name: 'HackerRank',
        color: '#2ec866',
        icon: '💻',
        description: 'Build coding skills with HackerRank challenges'
      },
      codechef: {
        name: 'CodeChef',
        color: '#7b2cbf',
        icon: '🍽️',
        description: 'Compete and learn with CodeChef contests'
      }
    };
    return platforms[platform as keyof typeof platforms];
  };

  const getExistingProfile = (platform: string) => {
    return existingProfiles.find(p => p.platform === platform);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        p: 3
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <SyncIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Manage Coding Profiles
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Sync your profiles from coding platforms
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Platform Usernames
        </Typography>

        <Stack spacing={3}>
          {Object.entries(usernames).map(([platform, username]) => {
            const platformInfo = getPlatformInfo(platform);
            const existingProfile = getExistingProfile(platform);
            const isSyncing = syncing === platform;

            return (
              <Paper key={platform} elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: platformInfo.color, width: 40, height: 40 }}>
                    {platformInfo.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {platformInfo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {platformInfo.description}
                    </Typography>
                  </Box>
                  {existingProfile && (
                    <Chip
                      label="Synced"
                      color="success"
                      size="small"
                      icon={<CheckIcon />}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    fullWidth
                    label={`${platformInfo.name} Username`}
                    value={username}
                    onChange={(e) => handleUsernameChange(platform, e.target.value)}
                    placeholder={`Enter your ${platformInfo.name} username`}
                    disabled={isSyncing}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={isSyncing ? <CircularProgress size={20} /> : <SyncIcon />}
                    onClick={() => handleSyncPlatform(platform)}
                    disabled={isSyncing || !username.trim()}
                    sx={{
                      background: platformInfo.color,
                      '&:hover': {
                        background: platformInfo.color,
                        opacity: 0.9
                      }
                    }}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </Button>
                </Stack>

                {existingProfile && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Last Synced: {new Date(existingProfile.lastSynced).toLocaleString()}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Problems: <strong>{existingProfile.problemsSolved}</strong>
                        </Typography>
                      </Grid>
                      <Grid xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Rating: <strong>{existingProfile.rating}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
            onClick={handleSyncAll}
            disabled={loading || Object.values(usernames).every(u => !u.trim())}
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
              }
            }}
          >
            {loading ? 'Syncing All Profiles...' : 'Sync All Profiles'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
