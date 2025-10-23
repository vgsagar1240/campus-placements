import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  Paper,
  LinearProgress,
  Chip,
  Avatar,

  CircularProgress,
  IconButton,
  Tooltip,
  Fade,

} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
 
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { dailyQuestionService, QuestionStats } from '../services/dailyQuestionService';
import { profileSyncService, PlatformProfile } from '../services/profileSyncService';
import { useAuth } from '../contexts/AuthContext';
import ProfileManagement from './ProfileManagement';

export default function UnifiedCodingProfile() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [profileManagementOpen, setProfileManagementOpen] = useState(false);

  const loadProfiles = useCallback(async () => {
    if (user) {
      try {
        const savedProfiles = await profileSyncService.getUserProfiles(user.uid);
        setProfiles(savedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      }
    }
  }, [user]);

  const loadStats = useCallback(() => {
    if (user) {
      const userStats = dailyQuestionService.getUserStats(user.uid);
      setStats(userStats);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadStats();
    }
  }, [user, loadProfiles, loadStats]);

  const handleSyncProfiles = async () => {
    setSyncing(true);
    try {
      await loadProfiles();
    } catch (error) {
      console.error('Error syncing profiles:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleProfilesUpdated = (updatedProfiles: PlatformProfile[]) => {
    setProfiles(updatedProfiles);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'leetcode': return '#ffa116';
      case 'hackerrank': return '#2ec866';
      case 'codechef': return '#7b2cbf';
      default: return '#666';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'leetcode': return '🧮';
      case 'hackerrank': return '💻';
      case 'codechef': return '🍽️';
      default: return '📊';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'leetcode': return 'LeetCode';
      case 'hackerrank': return 'HackerRank';
      case 'codechef': return 'CodeChef';
      default: return platform;
    }
  };

  const getTotalScore = () => {
    return profiles.reduce((sum, profile) => sum + (profile.score || 0), 0);
  };

  const getTotalProblems = () => {
    return profiles.reduce((sum, profile) => sum + (profile.problemsSolved || 0), 0);
  };

  const getAverageRating = () => {
    if (profiles.length === 0) return 0;
    const totalRating = profiles.reduce((sum, profile) => sum + (profile.rating || 0), 0);
    return Math.floor(totalRating / profiles.length);
  };

  const getBestPlatform = () => {
    if (profiles.length === 0) {
      return { platform: 'None', score: 0 };
    }
    return profiles.reduce((best, profile) => 
      (profile.score || 0) > (best.score || 0) ? profile : best
    );
  };

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
            Loading coding profiles...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalScore = getTotalScore();
  const totalProblems = getTotalProblems();
  const averageRating = getAverageRating();
  const bestPlatform = getBestPlatform();

  return (
    <Card elevation={3} sx={{ borderRadius: 4 }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        p: 4
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 64, 
              height: 64,
              fontSize: '2rem'
            }}>
              <CodeIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Coding Profile Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Track your progress across all platforms
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Sync Profiles">
              <IconButton 
                onClick={handleSyncProfiles} 
                disabled={syncing}
                sx={{ color: 'white' }}
              >
                {syncing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage Profiles">
              <IconButton 
                onClick={() => setProfileManagementOpen(true)}
                sx={{ color: 'white' }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {/* Overall Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {totalScore}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Score
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {totalProblems}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Problems Solved
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {averageRating}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Average Rating
              </Typography>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {bestPlatform.platform}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Best Platform
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Platform Profiles */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Platform Profiles
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setProfileManagementOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Profile
          </Button>
        </Stack>
        
        {profiles.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No Coding Profiles Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your coding platform usernames to track your progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setProfileManagementOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Your First Profile
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {profiles.map((profile, index) => (
              <Grid xs={12} md={4} key={index}>
                <Fade in timeout={600 + index * 200}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: getPlatformColor(profile.platform),
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        elevation: 6,
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease-in-out'
                      }
                    }}
                  >
                    {/* Platform Header */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: getPlatformColor(profile.platform), 
                        width: 48, 
                        height: 48,
                        fontSize: '1.5rem'
                      }}>
                        {getPlatformIcon(profile.platform)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getPlatformName(profile.platform)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{profile.username || 'Unknown'}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => window.open(profile.profileUrl, '_blank')}
                        sx={{ color: getPlatformColor(profile.platform) }}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                    </Stack>

                  {/* Score and Rating */}
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Score
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: getPlatformColor(profile.platform) }}>
                          {profile.score || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={((profile.score || 0) / 3000) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: getPlatformColor(profile.platform)
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Problems Solved
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {profile.problemsSolved || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={((profile.problemsSolved || 0) / 500) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.100',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: getPlatformColor(profile.platform)
                          }
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* Stats Grid */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {profile.rating || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                          #{profile.rank || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rank
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                          {profile.streak || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Streak
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {profile.lastActive || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last Active
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Achievements */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Achievements
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(profile.achievements || []).slice(0, 2).map((achievement, idx) => (
                        <Chip
                          key={idx}
                          label={achievement}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            backgroundColor: `${getPlatformColor(profile.platform)}20`,
                            color: getPlatformColor(profile.platform),
                            fontWeight: 600
                          }}
                        />
                      ))}
                      {(profile.achievements || []).length > 2 && (
                        <Chip
                          label={`+${(profile.achievements || []).length - 2}`}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(profile.profileUrl, '_blank')}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      background: getPlatformColor(profile.platform),
                      '&:hover': {
                        background: getPlatformColor(profile.platform),
                        opacity: 0.9
                      }
                    }}
                  >
                    Visit Profile
                  </Button>
                </Paper>
              </Fade>
            </Grid>
          ))}
          </Grid>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleSyncProfiles}
                disabled={syncing}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {syncing ? 'Syncing...' : 'Sync All Profiles'}
              </Button>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => window.open('https://leetcode.com/problemset/all/', '_blank')}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Practice Problems
              </Button>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrophyIcon />}
                onClick={() => window.open('https://www.hackerrank.com/contests', '_blank')}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Join Contests
              </Button>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={() => window.open('https://www.codechef.com/contests', '_blank')}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                CodeChef Contests
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      {/* Profile Management Dialog */}
      <ProfileManagement
        open={profileManagementOpen}
        onClose={() => setProfileManagementOpen(false)}
        onProfilesUpdated={handleProfilesUpdated}
      />
    </Card>
  );
}
