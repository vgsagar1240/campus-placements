// Coding Platform API Integration Service

export interface CodingProfile {
  platform: 'leetcode' | 'hackerrank' | 'codechef';
  username: string;
  rating?: number;
  problemsSolved?: number;
  contestsParticipated?: number;
  lastActive?: string;
  profileUrl?: string;
}

export interface CodingStats {
  totalProblems: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRank?: number;
  rating?: number;
  streak?: number;
}

class CodingPlatformService {
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests

  // LeetCode Integration (with CORS handling)
  async getLeetCodeProfile(username: string): Promise<CodingProfile | null> {
    try {
      // Since LeetCode API has CORS restrictions, we'll use a mock approach
      // In a real application, you'd need a backend proxy or use a CORS proxy service
      
      // For now, we'll create a mock profile based on username
      // This simulates the API response without actual network calls
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on username patterns
      const mockRating = Math.floor(Math.random() * 2000) + 500; // 500-2500 range
      const mockProblemsSolved = Math.floor(Math.random() * 500) + 50; // 50-550 range
      
      return {
        platform: 'leetcode',
        username,
        rating: mockRating,
        problemsSolved: mockProblemsSolved,
        profileUrl: `https://leetcode.com/${username}/`
      };
    } catch (error) {
      console.error('Error fetching LeetCode profile:', error);
      return null;
    }
  }

  // HackerRank Integration (with CORS handling)
  async getHackerRankProfile(username: string, apiKey?: string): Promise<CodingProfile | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      // In production, you'd need a backend proxy to handle CORS
      const mockRating = Math.floor(Math.random() * 3000) + 1000; // 1000-4000 range
      const mockProblemsSolved = Math.floor(Math.random() * 300) + 20; // 20-320 range
      
      return {
        platform: 'hackerrank',
        username,
        rating: mockRating,
        problemsSolved: mockProblemsSolved,
        profileUrl: `https://www.hackerrank.com/${username}`
      };
    } catch (error) {
      console.error('Error fetching HackerRank profile:', error);
      return null;
    }
  }

  // CodeChef Integration (with CORS handling)
  async getCodeChefProfile(username: string): Promise<CodingProfile | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      // In production, you'd need a backend proxy to handle CORS
      const mockRating = Math.floor(Math.random() * 2500) + 500; // 500-3000 range
      const mockProblemsSolved = Math.floor(Math.random() * 200) + 30; // 30-230 range
      const mockContests = Math.floor(Math.random() * 50) + 5; // 5-55 range
      
      return {
        platform: 'codechef',
        username,
        rating: mockRating,
        problemsSolved: mockProblemsSolved,
        contestsParticipated: mockContests,
        profileUrl: `https://www.codechef.com/users/${username}`
      };
    } catch (error) {
      console.error('Error fetching CodeChef profile:', error);
      return null;
    }
  }

  // Get all coding profiles for a user
  async getAllCodingProfiles(userId: string, usernames: {
    leetcode?: string;
    hackerrank?: string;
    codechef?: string;
  }, hackerrankApiKey?: string): Promise<CodingProfile[]> {
    const profiles: CodingProfile[] = [];
    
    // Add delay between requests to respect rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (usernames.leetcode) {
      const profile = await this.getLeetCodeProfile(usernames.leetcode);
      if (profile) profiles.push(profile);
      await delay(this.RATE_LIMIT_DELAY);
    }

    if (usernames.hackerrank && hackerrankApiKey) {
      const profile = await this.getHackerRankProfile(usernames.hackerrank, hackerrankApiKey);
      if (profile) profiles.push(profile);
      await delay(this.RATE_LIMIT_DELAY);
    }

    if (usernames.codechef) {
      const profile = await this.getCodeChefProfile(usernames.codechef);
      if (profile) profiles.push(profile);
      await delay(this.RATE_LIMIT_DELAY);
    }

    return profiles;
  }

  // Calculate overall coding score
  calculateCodingScore(profiles: CodingProfile[]): number {
    let totalScore = 0;
    let platformCount = 0;

    profiles.forEach(profile => {
      if (profile.rating && profile.rating > 0) {
        // Normalize ratings to 0-100 scale
        let normalizedRating = 0;
        
        switch (profile.platform) {
          case 'leetcode':
            // LeetCode ranking (lower is better)
            normalizedRating = Math.max(0, 100 - (profile.rating / 100));
            break;
          case 'hackerrank':
            // HackerRank rating
            normalizedRating = Math.min(100, profile.rating / 10);
            break;
          case 'codechef':
            // CodeChef rating
            normalizedRating = Math.min(100, profile.rating / 50);
            break;
        }
        
        totalScore += normalizedRating;
        platformCount++;
      }
    });

    return platformCount > 0 ? totalScore / platformCount : 0;
  }
}

export const codingPlatformService = new CodingPlatformService();
