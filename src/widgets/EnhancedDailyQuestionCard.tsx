import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Avatar,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Code as CodeIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  Timer as TimerIcon,
  Memory as MemoryIcon,
  TrendingUp as TrendingUpIcon,

  Refresh as RefreshIcon,

  Dashboard as DashboardIcon,
  Score as ScoreIcon,
  EmojiEvents as TrophyIcon,

} from '@mui/icons-material';
import { dailyQuestionService, DailyQuestion, QuestionStats } from '../services/dailyQuestionService';
import { useAuth } from '../contexts/AuthContext';

interface EnhancedDailyQuestionCardProps {
  onStatsUpdate?: (stats: QuestionStats) => void;
}

export default function EnhancedDailyQuestionCard({ onStatsUpdate }: EnhancedDailyQuestionCardProps) {
  const { user } = useAuth();
  const [todaysQuestion, setTodaysQuestion] = useState<DailyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);

  const loadUserStats = useCallback(() => {
    if (user) {
      const userStats = dailyQuestionService.getUserStats(user.uid);
      setStats(userStats);
      if (onStatsUpdate) {
        onStatsUpdate(userStats);
      }
    }
  }, [user, onStatsUpdate]);

  const loadTodaysQuestion = async () => {
    try {
      setLoading(true);
      const question = await dailyQuestionService.getTodaysQuestion();
      setTodaysQuestion(question);
      setCompleted(question?.isCompleted || false);
    } catch (error) {
      console.error('Error loading today\'s question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTodaysQuestion();
      loadUserStats();
    }
  }, [user, loadUserStats]);

  const handleMarkCompleted = async () => {
    if (user && todaysQuestion) {
      await dailyQuestionService.markQuestionCompleted(todaysQuestion.id, user.uid);
      setCompleted(true);
      loadUserStats();
      setShowScoreDialog(true);
    }
  };

  const handleRefresh = () => {
    loadTodaysQuestion();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
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

  const getPlatformDashboardUrl = (platform: string) => {
    switch (platform) {
      case 'leetcode': return 'https://leetcode.com/problemset/all/';
      case 'hackerrank': return 'https://www.hackerrank.com/domains/algorithms';
      case 'codechef': return 'https://www.codechef.com/problems/school';
      default: return '#';
    }
  };

  const calculateScore = () => {
    if (!todaysQuestion) return 0;
    
    let baseScore = 0;
    switch (todaysQuestion.difficulty) {
      case 'Easy': baseScore = 10; break;
      case 'Medium': baseScore = 20; break;
      case 'Hard': baseScore = 30; break;
    }
    
    // Bonus for platform variety
    const platformBonus = {
      'leetcode': 5,
      'hackerrank': 3,
      'codechef': 2
    };
    
    return baseScore + (platformBonus[todaysQuestion.platform] || 0);
  };

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
            Loading today's challenge...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fetching the perfect question for you
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!todaysQuestion) {
    return (
      <Card elevation={3} sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Unable to load today's question. Please try again later.
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Main Daily Question Card */}
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 4, 
          mb: 3,
          background: completed ? 
            'linear-gradient(135deg, #10b98115 0%, #05966915 100%)' :
            'linear-gradient(135deg, #3b82f615 0%, #1d4ed815 100%)',
          border: '2px solid',
          borderColor: completed ? 'success.main' : 'primary.main',
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                badgeContent={completed ? <CheckCircleIcon fontSize="small" /> : 0}
                color="success"
              >
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 56, 
                  height: 56,
                  fontSize: '1.5rem'
                }}>
                  {getPlatformIcon(todaysQuestion.platform)}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Daily Coding Challenge
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Question">
                <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Details">
                <IconButton onClick={() => setOpenDetails(true)} sx={{ color: 'white' }}>
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Question Info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              {todaysQuestion.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {todaysQuestion.description}
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
              <Chip
                label={todaysQuestion.difficulty}
                color={getDifficultyColor(todaysQuestion.difficulty) as any}
                size="medium"
                sx={{ fontWeight: 700, fontSize: '0.9rem' }}
              />
              <Chip
                label={todaysQuestion.platform.toUpperCase()}
                size="medium"
                sx={{ 
                  backgroundColor: getPlatformColor(todaysQuestion.platform),
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              />
              {todaysQuestion.acceptanceRate && (
                <Chip
                  label={`${todaysQuestion.acceptanceRate.toFixed(1)}% acceptance`}
                  variant="outlined"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>

            {/* Tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {todaysQuestion.tags.slice(0, 4).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="medium"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                />
              ))}
              {todaysQuestion.tags.length > 4 && (
                <Chip
                  label={`+${todaysQuestion.tags.length - 4} more`}
                  size="medium"
                  variant="outlined"
                  sx={{ fontSize: '0.8rem' }}
                />
              )}
            </Stack>
          </Box>

          {/* Stats Section */}
          {stats && (
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid xs={12} sm={4}>
                  <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <TrophyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {stats.streak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Day Streak
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats.completedQuestions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                    <ScoreIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {calculateScore()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points Today
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(todaysQuestion.url, '_blank')}
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: `linear-gradient(45deg, ${getPlatformColor(todaysQuestion.platform)} 30%, ${getPlatformColor(todaysQuestion.platform)}dd 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${getPlatformColor(todaysQuestion.platform)}dd 30%, ${getPlatformColor(todaysQuestion.platform)} 90%)`,
                }
              }}
            >
              Solve on {todaysQuestion.platform.charAt(0).toUpperCase() + todaysQuestion.platform.slice(1)}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<DashboardIcon />}
              onClick={() => window.open(getPlatformDashboardUrl(todaysQuestion.platform), '_blank')}
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderColor: getPlatformColor(todaysQuestion.platform),
                color: getPlatformColor(todaysQuestion.platform),
                '&:hover': {
                  borderColor: getPlatformColor(todaysQuestion.platform),
                  backgroundColor: `${getPlatformColor(todaysQuestion.platform)}15`
                }
              }}
            >
              Go to Dashboard
            </Button>

            {!completed && (
              <Button
                variant="contained"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkCompleted}
                sx={{ 
                  borderRadius: 3, 
                  px: 4, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                  }
                }}
              >
                Mark Completed
              </Button>
            )}
            
            {completed && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<CheckCircleIcon />}
                disabled
                sx={{ 
                  borderRadius: 3, 
                  px: 4, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderColor: 'success.main',
                  color: 'success.main'
                }}
              >
                Completed ✓
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Question Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CodeIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Question Details
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {todaysQuestion.title}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Problem" />
            <Tab label="Examples" />
            <Tab label="Hints" />
            <Tab label="Platform Info" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Problem Statement
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {todaysQuestion.description}
              </Typography>
              
              {todaysQuestion.constraints.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Constraints
                  </Typography>
                  <Stack spacing={1}>
                    {todaysQuestion.constraints.map((constraint, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {constraint}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Examples
              </Typography>
              <Stack spacing={3}>
                {todaysQuestion.examples.map((example, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Example {index + 1}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Input:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      {example.input}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Output:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      {example.output}
                    </Typography>
                    {example.explanation && (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Explanation:
                        </Typography>
                        <Typography variant="body2">
                          {example.explanation}
                        </Typography>
                      </>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hints
              </Typography>
              <Stack spacing={2}>
                {todaysQuestion.hints.map((hint, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LightbulbIcon color="warning" sx={{ mt: 0.5 }} />
                    <Typography variant="body1">
                      {hint}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Platform Information
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: getPlatformColor(todaysQuestion.platform) }}>
                        {getPlatformIcon(todaysQuestion.platform)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {todaysQuestion.platform.charAt(0).toUpperCase() + todaysQuestion.platform.slice(1)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Platform-specific information and features
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <TimerIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Time Limit
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {todaysQuestion.timeLimit}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <MemoryIcon color="info" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Memory Limit
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {todaysQuestion.memoryLimit}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Acceptance Rate
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {todaysQuestion.acceptanceRate?.toFixed(1)}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDetails(false)} variant="outlined" size="large">
            Close
          </Button>
          <Button
            onClick={() => {
              window.open(todaysQuestion.url, '_blank');
              setOpenDetails(false);
            }}
            variant="contained"
            size="large"
            startIcon={<OpenInNewIcon />}
          >
            Open in {todaysQuestion.platform.charAt(0).toUpperCase() + todaysQuestion.platform.slice(1)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Score Dialog */}
      <Dialog open={showScoreDialog} onClose={() => setShowScoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', p: 4 }}>
          <TrophyIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Congratulations!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            You completed today's challenge
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            +{calculateScore()} Points
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Great job solving the {todaysQuestion.difficulty.toLowerCase()} problem on {todaysQuestion.platform}!
          </Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Your Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Streak: {stats?.streak || 0} days | Total: {stats?.completedQuestions || 0} problems
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => setShowScoreDialog(false)}
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Awesome!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
