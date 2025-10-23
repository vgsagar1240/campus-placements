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
  Avatar
} from '@mui/material';
import {
  Code as CodeIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb as LightbulbIcon,
  Timer as TimerIcon,
  Memory as MemoryIcon,

  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { dailyQuestionService, DailyQuestion, QuestionStats } from '../services/dailyQuestionService';
import { useAuth } from '../contexts/AuthContext';

interface DailyQuestionCardProps {
  onStatsUpdate?: (stats: QuestionStats) => void;
}

export default function DailyQuestionCard({ onStatsUpdate }: DailyQuestionCardProps) {
  const { user } = useAuth();
  const [todaysQuestion, setTodaysQuestion] = useState<DailyQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [completed, setCompleted] = useState(false);

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

  if (loading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading today's question...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!todaysQuestion) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Unable to load today's question. Please try again later.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          mb: 3,
          background: completed ? 
            'linear-gradient(135deg, #10b98115 0%, #05966915 100%)' :
            'linear-gradient(135deg, #3b82f615 0%, #1d4ed815 100%)',
          border: '1px solid',
          borderColor: completed ? 'success.main' : 'primary.main'
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                badgeContent={completed ? <CheckCircleIcon fontSize="small" /> : 0}
                color="success"
              >
                <Avatar sx={{ bgcolor: getPlatformColor(todaysQuestion.platform) }}>
                  {getPlatformIcon(todaysQuestion.platform)}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Daily Coding Challenge
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Details">
                <IconButton onClick={() => setOpenDetails(true)} size="small">
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Question Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {todaysQuestion.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {todaysQuestion.description}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={todaysQuestion.difficulty}
                color={getDifficultyColor(todaysQuestion.difficulty) as any}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={todaysQuestion.platform.toUpperCase()}
                size="small"
                sx={{ 
                  backgroundColor: getPlatformColor(todaysQuestion.platform),
                  color: 'white',
                  fontWeight: 600
                }}
              />
              {todaysQuestion.acceptanceRate && (
                <Chip
                  label={`${todaysQuestion.acceptanceRate.toFixed(1)}% acceptance`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>

            {/* Tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {todaysQuestion.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {todaysQuestion.tags.length > 3 && (
                <Chip
                  label={`+${todaysQuestion.tags.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </Box>

          {/* Stats */}
          {stats && (
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.streak}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {stats.completedQuestions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {stats.totalQuestions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(todaysQuestion.url, '_blank')}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Solve on {todaysQuestion.platform.charAt(0).toUpperCase() + todaysQuestion.platform.slice(1)}
            </Button>
            {!completed && (
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkCompleted}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Mark as Completed
              </Button>
            )}
            {completed && (
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                disabled
                sx={{ borderRadius: 2, px: 3 }}
              >
                Completed ✓
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Question Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CodeIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Question Details
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Problem Info */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {todaysQuestion.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {todaysQuestion.description}
              </Typography>
            </Box>

            {/* Constraints */}
            {todaysQuestion.constraints.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
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

            {/* Examples */}
            {todaysQuestion.examples.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Examples
                </Typography>
                <Stack spacing={2}>
                  {todaysQuestion.examples.map((example, index) => (
                    <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Input:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        {example.input}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Output:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {example.output}
                      </Typography>
                      {example.explanation && (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
                            Explanation:
                          </Typography>
                          <Typography variant="body2">
                            {example.explanation}
                          </Typography>
                        </>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Hints */}
            {todaysQuestion.hints.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Hints
                </Typography>
                <Stack spacing={1}>
                  {todaysQuestion.hints.map((hint, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LightbulbIcon fontSize="small" color="warning" sx={{ mt: 0.5 }} />
                      <Typography variant="body2">
                        {hint}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Platform Info */}
            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimerIcon color="primary" />
                <Typography variant="body2">
                  Time Limit: {todaysQuestion.timeLimit}
                </Typography>
                <MemoryIcon color="primary" />
                <Typography variant="body2">
                  Memory Limit: {todaysQuestion.memoryLimit}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDetails(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              window.open(todaysQuestion.url, '_blank');
              setOpenDetails(false);
            }}
            variant="contained"
            startIcon={<OpenInNewIcon />}
          >
            Open in {todaysQuestion.platform.charAt(0).toUpperCase() + todaysQuestion.platform.slice(1)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
