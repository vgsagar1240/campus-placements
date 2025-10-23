import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';

export interface Drive {
  id: string;
  title: string;
  description: string;
  driveDate: string;
  eligibility: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  maxApplications?: number;
  currentApplications?: number;
  createdAt: string;
  updatedAt: string;
}

class DriveAutoCompletionService {
  /**
   * Check and automatically complete drives that have passed their drive date
   * This should be called periodically (e.g., daily via cron job or on app startup)
   */
  async checkAndCompleteExpiredDrives(): Promise<{ completed: number; errors: string[] }> {
    try {
      console.log('Checking for expired drives...');
      
      // Get all active drives
      const activeDrivesQuery = query(
        collection(db, 'drives'),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(activeDrivesQuery);
      const drives = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Drive[];
      
      const now = new Date();
      const expiredDrives: Drive[] = [];
      const errors: string[] = [];
      
      // Check each drive to see if it's expired
      drives.forEach(drive => {
        try {
          const driveDate = new Date(drive.driveDate);
          
          // If drive date has passed (is in the past), mark as expired
          if (driveDate < now) {
            expiredDrives.push(drive);
            console.log(`Drive "${drive.title}" expired on ${driveDate.toISOString()}`);
          }
        } catch (error) {
          console.error(`Error parsing date for drive ${drive.id}:`, error);
          errors.push(`Invalid date format for drive: ${drive.title}`);
        }
      });
      
      if (expiredDrives.length === 0) {
        console.log('No expired drives found');
        return { completed: 0, errors };
      }
      
      // Use batch write for better performance and atomicity
      const batch = writeBatch(db);
      
      expiredDrives.forEach(drive => {
        const driveRef = doc(db, 'drives', drive.id);
        batch.update(driveRef, {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          autoCompleted: true // Flag to indicate this was auto-completed
        });
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log(`Successfully completed ${expiredDrives.length} expired drives`);
      
      return { 
        completed: expiredDrives.length, 
        errors 
      };
      
    } catch (error) {
      console.error('Error checking and completing expired drives:', error);
      return { 
        completed: 0, 
        errors: [`Failed to check expired drives: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }
  
  /**
   * Check if a specific drive is expired
   */
  isDriveExpired(driveDate: string): boolean {
    try {
      const date = new Date(driveDate);
      const now = new Date();
      return date < now;
    } catch {
      return false;
    }
  }
  
  /**
   * Get drives that are about to expire (within next 24 hours)
   */
  async getDrivesExpiringSoon(): Promise<Drive[]> {
    try {
      const activeDrivesQuery = query(
        collection(db, 'drives'),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(activeDrivesQuery);
      const drives = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Drive[];
      
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      return drives.filter(drive => {
        try {
          const driveDate = new Date(drive.driveDate);
          return driveDate >= now && driveDate <= tomorrow;
        } catch {
          return false;
        }
      });
      
    } catch (error) {
      console.error('Error getting drives expiring soon:', error);
      return [];
    }
  }
  
  /**
   * Manually complete a drive (for admin use)
   */
  async manuallyCompleteDrive(driveId: string): Promise<boolean> {
    try {
      const driveRef = doc(db, 'drives', driveId);
      await updateDoc(driveRef, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        manuallyCompleted: true // Flag to indicate this was manually completed
      });
      
      console.log(`Drive ${driveId} manually completed`);
      return true;
    } catch (error) {
      console.error('Error manually completing drive:', error);
      return false;
    }
  }
}

// Export singleton instance
export const driveAutoCompletionService = new DriveAutoCompletionService();
export default driveAutoCompletionService;
