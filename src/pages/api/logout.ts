// Optional API endpoint for logout tracking
// This is mainly for analytics/logging purposes
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { uid } = req.body;
      
      // Log the logout event (optional)
      console.log(`User ${uid} logged out via app closure`);
      
      // You can add additional logging or analytics here
      // For example, track session duration, etc.
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Logout API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
