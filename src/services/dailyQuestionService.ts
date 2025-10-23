// Daily Coding Question Service
// Fetches one question per day from LeetCode, HackerRank, and CodeChef

export interface DailyQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'leetcode' | 'hackerrank' | 'codechef';
  tags: string[];
  url: string;
  acceptanceRate?: number;
  likes?: number;
  dislikes?: number;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: string[];
  date: string; // YYYY-MM-DD format
  isCompleted?: boolean;
  timeLimit?: string;
  memoryLimit?: string;
}

export interface QuestionStats {
  totalQuestions: number;
  completedQuestions: number;
  streak: number;
  lastCompletedDate: string | null;
  platformBreakdown: {
    leetcode: number;
    hackerrank: number;
    codechef: number;
  };
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

class DailyQuestionService {
  private readonly STORAGE_KEY = 'daily_questions';
  private readonly USER_STATS_KEY = 'user_question_stats';

  // LeetCode API - Get random problem (with CORS handling)
  async getLeetCodeQuestion(): Promise<DailyQuestion | null> {
    try {
      // Since LeetCode API has CORS restrictions, we'll use predefined problems
      const leetCodeProblems = [
        {
          title: "Two Sum",
          difficulty: "Easy",
          tags: ["Array", "Hash Table"],
          url: "https://leetcode.com/problems/two-sum/",
          acceptanceRate: 45.7
        },
        {
          title: "Add Two Numbers",
          difficulty: "Medium",
          tags: ["Linked List", "Math", "Recursion"],
          url: "https://leetcode.com/problems/add-two-numbers/",
          acceptanceRate: 36.8
        },
        {
          title: "Longest Substring Without Repeating Characters",
          difficulty: "Medium",
          tags: ["Hash Table", "String", "Sliding Window"],
          url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
          acceptanceRate: 33.8
        },
        {
          title: "Median of Two Sorted Arrays",
          difficulty: "Hard",
          tags: ["Array", "Binary Search", "Divide and Conquer"],
          url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
          acceptanceRate: 33.5
        },
        {
          title: "Longest Palindromic Substring",
          difficulty: "Medium",
          tags: ["String", "Dynamic Programming"],
          url: "https://leetcode.com/problems/longest-palindromic-substring/",
          acceptanceRate: 32.1
        },
        {
          title: "ZigZag Conversion",
          difficulty: "Medium",
          tags: ["String"],
          url: "https://leetcode.com/problems/zigzag-conversion/",
          acceptanceRate: 40.2
        },
        {
          title: "Reverse Integer",
          difficulty: "Easy",
          tags: ["Math"],
          url: "https://leetcode.com/problems/reverse-integer/",
          acceptanceRate: 27.5
        },
        {
          title: "String to Integer (atoi)",
          difficulty: "Medium",
          tags: ["String"],
          url: "https://leetcode.com/problems/string-to-integer-atoi/",
          acceptanceRate: 16.6
        }
      ];

      const randomProblem = leetCodeProblems[Math.floor(Math.random() * leetCodeProblems.length)];
      
      return {
        id: `leetcode_${randomProblem.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: randomProblem.title,
        description: `LeetCode ${randomProblem.difficulty} Problem`,
        difficulty: randomProblem.difficulty as 'Easy' | 'Medium' | 'Hard',
        platform: 'leetcode',
        tags: randomProblem.tags,
        url: randomProblem.url,
        acceptanceRate: randomProblem.acceptanceRate,
        examples: [
          {
            input: "Sample input will be provided on LeetCode",
            output: "Expected output will be shown",
            explanation: "Visit the LeetCode link to see the full problem statement and examples"
          }
        ],
        constraints: [
          "Visit the LeetCode link for full constraints",
          "Follow the input/output format specified"
        ],
        hints: [
          "Read the problem statement carefully on LeetCode",
          "Consider edge cases",
          "Think about time and space complexity",
          "Start with a brute force approach, then optimize"
        ],
        date: new Date().toISOString().split('T')[0],
        timeLimit: "1 second",
        memoryLimit: "256 MB"
      };
    } catch (error) {
      console.error('Error fetching LeetCode question:', error);
      return null;
    }
  }

  // HackerRank API - Get random problem
  async getHackerRankQuestion(): Promise<DailyQuestion | null> {
    try {
      // HackerRank doesn't have a public API for random problems
      // We'll use a predefined list of popular problems
      const popularProblems = [
        {
          title: "Solve Me First",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/solve-me-first/problem"
        },
        {
          title: "Simple Array Sum",
          difficulty: "Easy", 
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/simple-array-sum/problem"
        },
        {
          title: "Compare the Triplets",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/compare-the-triplets/problem"
        },
        {
          title: "A Very Big Sum",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/a-very-big-sum/problem"
        },
        {
          title: "Diagonal Difference",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/diagonal-difference/problem"
        },
        {
          title: "Plus Minus",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/plus-minus/problem"
        },
        {
          title: "Staircase",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/staircase/problem"
        },
        {
          title: "Mini-Max Sum",
          difficulty: "Easy",
          tags: ["Algorithms", "Warmup"],
          url: "https://www.hackerrank.com/challenges/mini-max-sum/problem"
        }
      ];

      const randomProblem = popularProblems[Math.floor(Math.random() * popularProblems.length)];
      
      return {
        id: `hackerrank_${randomProblem.title.toLowerCase().replace(/\s+/g, '_')}`,
        title: randomProblem.title,
        description: `HackerRank ${randomProblem.difficulty} Problem`,
        difficulty: randomProblem.difficulty as 'Easy' | 'Medium' | 'Hard',
        platform: 'hackerrank',
        tags: randomProblem.tags,
        url: randomProblem.url,
        examples: [
          {
            input: "Sample input will be provided on the platform",
            output: "Expected output will be shown",
            explanation: "Visit the link to see the full problem statement"
          }
        ],
        constraints: [
          "Visit the HackerRank link for full constraints",
          "Follow the input/output format specified"
        ],
        hints: [
          "Read the problem statement on HackerRank",
          "Pay attention to input/output format",
          "Test with sample inputs first"
        ],
        date: new Date().toISOString().split('T')[0],
        timeLimit: "2 seconds",
        memoryLimit: "512 MB"
      };
    } catch (error) {
      console.error('Error fetching HackerRank question:', error);
      return null;
    }
  }

  // CodeChef API - Get random problem
  async getCodeChefQuestion(): Promise<DailyQuestion | null> {
    try {
      // CodeChef doesn't have a public API for random problems
      // We'll use a predefined list of popular problems
      const popularProblems = [
        {
          title: "START01",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/START01"
        },
        {
          title: "FLOW001",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW001"
        },
        {
          title: "FLOW002",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW002"
        },
        {
          title: "FLOW004",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW004"
        },
        {
          title: "FLOW005",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW005"
        },
        {
          title: "FLOW006",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW006"
        },
        {
          title: "FLOW007",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW007"
        },
        {
          title: "FLOW008",
          difficulty: "Easy",
          tags: ["Implementation", "Beginner"],
          url: "https://www.codechef.com/problems/FLOW008"
        }
      ];

      const randomProblem = popularProblems[Math.floor(Math.random() * popularProblems.length)];
      
      return {
        id: `codechef_${randomProblem.title.toLowerCase()}`,
        title: randomProblem.title,
        description: `CodeChef ${randomProblem.difficulty} Problem`,
        difficulty: randomProblem.difficulty as 'Easy' | 'Medium' | 'Hard',
        platform: 'codechef',
        tags: randomProblem.tags,
        url: `https://www.codechef.com/problems/${randomProblem.title}`,
        examples: [
          {
            input: "Sample input will be provided on the platform",
            output: "Expected output will be shown",
            explanation: "Visit the link to see the full problem statement"
          }
        ],
        constraints: [
          "Visit the CodeChef link for full constraints",
          "Follow the input/output format specified"
        ],
        hints: [
          "Read the problem statement on CodeChef",
          "Pay attention to input/output format",
          "Test with sample inputs first"
        ],
        date: new Date().toISOString().split('T')[0],
        timeLimit: "1 second",
        memoryLimit: "256 MB"
      };
    } catch (error) {
      console.error('Error fetching CodeChef question:', error);
      return null;
    }
  }

  // Get today's question (rotates between platforms)
  async getTodaysQuestion(): Promise<DailyQuestion | null> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have today's question cached
    const cachedQuestion = this.getCachedQuestion(today);
    if (cachedQuestion) {
      return cachedQuestion;
    }

    // Rotate between platforms based on day of week
    const dayOfWeek = new Date().getDay();
    let question: DailyQuestion | null = null;

    try {
      switch (dayOfWeek % 3) {
        case 0: // Sunday, Wednesday
          question = await this.getLeetCodeQuestion();
          break;
        case 1: // Monday, Thursday
          question = await this.getHackerRankQuestion();
          break;
        case 2: // Tuesday, Friday
          question = await this.getCodeChefQuestion();
          break;
        default:
          question = await this.getLeetCodeQuestion();
      }

      // If primary platform fails, try others
      if (!question) {
        question = await this.getHackerRankQuestion();
      }
      if (!question) {
        question = await this.getCodeChefQuestion();
      }

      if (question) {
        // Cache the question for today
        this.cacheQuestion(question);
      }

      return question;
    } catch (error) {
      console.error('Error getting today\'s question:', error);
      return null;
    }
  }

  // Cache question for the day
  private cacheQuestion(question: DailyQuestion): void {
    try {
      const cached = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      cached[question.date] = question;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error('Error caching question:', error);
    }
  }

  // Get cached question for a specific date
  private getCachedQuestion(date: string): DailyQuestion | null {
    try {
      const cached = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      return cached[date] || null;
    } catch (error) {
      console.error('Error getting cached question:', error);
      return null;
    }
  }

  // Mark question as completed
  async markQuestionCompleted(questionId: string, userId: string): Promise<void> {
    try {
      const stats = this.getUserStats(userId);
      const today = new Date().toISOString().split('T')[0];
      
      // Update completion status
      const cached = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      if (cached[today]) {
        cached[today].isCompleted = true;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cached));
      }

      // Update user stats
      stats.completedQuestions++;
      stats.lastCompletedDate = today;
      
      // Calculate streak
      const lastCompleted = new Date(stats.lastCompletedDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastCompleted.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streak++;
      } else if (diffDays > 1) {
        stats.streak = 1;
      }

      this.saveUserStats(userId, stats);
    } catch (error) {
      console.error('Error marking question completed:', error);
    }
  }

  // Get user statistics
  getUserStats(userId: string): QuestionStats {
    try {
      const stats = JSON.parse(localStorage.getItem(`${this.USER_STATS_KEY}_${userId}`) || '{}');
      return {
        totalQuestions: stats.totalQuestions || 0,
        completedQuestions: stats.completedQuestions || 0,
        streak: stats.streak || 0,
        lastCompletedDate: stats.lastCompletedDate || null,
        platformBreakdown: stats.platformBreakdown || { leetcode: 0, hackerrank: 0, codechef: 0 },
        difficultyBreakdown: stats.difficultyBreakdown || { easy: 0, medium: 0, hard: 0 }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalQuestions: 0,
        completedQuestions: 0,
        streak: 0,
        lastCompletedDate: null,
        platformBreakdown: { leetcode: 0, hackerrank: 0, codechef: 0 },
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
      };
    }
  }

  // Save user statistics
  private saveUserStats(userId: string, stats: QuestionStats): void {
    try {
      localStorage.setItem(`${this.USER_STATS_KEY}_${userId}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // Get question history
  getQuestionHistory(days: number = 7): DailyQuestion[] {
    try {
      const cached = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      const history: DailyQuestion[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (cached[dateStr]) {
          history.push(cached[dateStr]);
        }
      }
      
      return history.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting question history:', error);
      return [];
    }
  }

  // Clear all cached data
  clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      // Note: User stats are kept as they're tied to user accounts
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const dailyQuestionService = new DailyQuestionService();
