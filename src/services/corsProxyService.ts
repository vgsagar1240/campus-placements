// CORS Proxy Service
// This service provides alternative methods to fetch data from external APIs
// when CORS restrictions prevent direct browser access

export class CORSProxyService {
  private static readonly PROXY_URLS = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  // Generic CORS proxy fetch
  static async fetchWithProxy(url: string, options?: RequestInit): Promise<Response | null> {
    for (const proxyUrl of this.PROXY_URLS) {
      try {
        const response = await fetch(proxyUrl + encodeURIComponent(url), {
          ...options,
          headers: {
            ...options?.headers,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} failed:`, error);
        continue;
      }
    }
    
    return null;
  }

  // LeetCode with CORS proxy
  static async fetchLeetCodeProfile(username: string): Promise<any> {
    try {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
      `;

      const response = await this.fetchWithProxy('https://leetcode.com/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username }
        })
      });

      if (response) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching LeetCode profile with proxy:', error);
      return null;
    }
  }

  // Alternative: Use a backend API endpoint
  static async fetchFromBackend(endpoint: string, data?: any): Promise<any> {
    try {
      // In production, replace with your actual backend URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${backendUrl}/${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching from backend:', error);
      return null;
    }
  }
}

// Usage examples for production:
/*
// 1. Using CORS proxy (less reliable)
const leetCodeData = await CORSProxyService.fetchLeetCodeProfile('username');

// 2. Using backend API (recommended)
const profileData = await CORSProxyService.fetchFromBackend('coding-profiles', {
  platform: 'leetcode',
  username: 'username'
});
*/
