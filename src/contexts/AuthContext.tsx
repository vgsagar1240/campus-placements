import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type Role = 'student' | 'employee' | null;


interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
  resetInactivityTimer: () => void;
  showInactivityWarning: boolean;
  inactivityTimeRemaining: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export const useAuth = () => useContext(AuthContext);


export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [role, setRole] = useState<Role>(null);
const [loading, setLoading] = useState(true);
const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before logout
const [showInactivityWarning, setShowInactivityWarning] = useState(false);
const [inactivityTimeRemaining, setInactivityTimeRemaining] = useState(0);

// Function to handle automatic logout
const handleAutoLogout = useCallback(async () => {
  console.log('Auto-logout triggered due to inactivity');
  try {
    await signOut(auth);
    setUser(null);
    setRole(null);
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  } catch (error) {
    console.error('Error during auto-logout:', error);
  }
}, []);

// Function to reset inactivity timer
const resetInactivityTimer = useCallback(() => {
  // Clear existing timers
  if (inactivityTimerRef.current) {
    clearTimeout(inactivityTimerRef.current);
  }
  if (warningTimerRef.current) {
    clearTimeout(warningTimerRef.current);
  }
  
  // Hide warning dialog
  setShowInactivityWarning(false);
  
  // Set new timers only if user is logged in
  if (user) {
    // Set warning timer (5 minutes before logout)
    warningTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      setInactivityTimeRemaining(WARNING_TIME / 1000); // Convert to seconds
    }, INACTIVITY_TIMEOUT - WARNING_TIME);
    
    // Set logout timer
    inactivityTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, INACTIVITY_TIMEOUT);
  }
}, [user, handleAutoLogout]);

// Function to handle application closure
const handleBeforeUnload = useCallback(async () => {
  if (user) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout on app close:', error);
    }
  }
}, [user]);

useEffect(() => {
const unsub = onAuthStateChanged(auth, async (u) => {
setUser(u);
if (u) {
// Add a small delay to ensure Firestore write operations are complete
await new Promise(resolve => setTimeout(resolve, 100));

const userRef = doc(db, 'users', u.uid);
const snapshot = await getDoc(userRef);
if (snapshot.exists()) {
const data = snapshot.data();
const userRole = data.role || null;
console.log('AuthContext - User role loaded:', userRole); // Debug log

// For students, check if their ID has expired
if (userRole === 'student' && data.studentId) {
  const currentYear = new Date().getFullYear();
  
  // Handle both short and long student IDs
  let yearDigits;
  if (data.studentId.length < 10) {
    // For shorter IDs like "23sagar", extract year from start
    const yearMatch = data.studentId.match(/^(\d{2})/);
    if (!yearMatch) return; // Skip validation if no year found
    yearDigits = parseInt(yearMatch[1]);
  } else {
    // For longer IDs, use first 2 digits
    yearDigits = parseInt(data.studentId.substring(0, 2));
  }
  
  const admissionYear = 2000 + yearDigits; // Convert 23 to 2023
  const yearsSinceAdmission = currentYear - admissionYear;
  
  // If student ID has expired (more than 4 years), sign them out
  if (yearsSinceAdmission > 4) {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setLoading(false);
    return;
  }
}

setRole(userRole);
} else {
// default to student when not present (optional)
await setDoc(userRef, { name: u.displayName || '', email: u.email, role: 'student' });
setRole('student');
}
} else {
setRole(null);
}
setLoading(false);
});
return () => unsub();
}, []);

// Set up inactivity timer and event listeners
useEffect(() => {
  if (user) {
    // Start the inactivity timer when user logs in
    resetInactivityTimer();

    // Event listeners for user activity
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Handle application closure
    const handleBeforeUnloadSync = () => {
      if (user) {
        // Use synchronous approach for beforeunload
        navigator.sendBeacon('/api/logout', JSON.stringify({ uid: user.uid }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnloadSync);

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      window.removeEventListener('beforeunload', handleBeforeUnloadSync);
      
      // Clear timers on cleanup
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  } else {
    // Clear timer when user logs out
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }
}, [user, resetInactivityTimer]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  };
}, []);


const logout = async () => {
  // Clear all timers
  if (inactivityTimerRef.current) {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = null;
  }
  if (warningTimerRef.current) {
    clearTimeout(warningTimerRef.current);
    warningTimerRef.current = null;
  }
  
  // Hide warning dialog
  setShowInactivityWarning(false);
  
  await signOut(auth);
  setUser(null);
  setRole(null);
};

const refreshRole = async () => {
if (user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const userRole = data.role || null;
      console.log('Refreshing role:', userRole); // Debug log
      setRole(userRole);
    }
  } catch (error) {
    console.error('Error refreshing role:', error);
  }
}
};


return (
<AuthContext.Provider value={{ 
  user, 
  role, 
  loading, 
  logout, 
  refreshRole, 
  resetInactivityTimer,
  showInactivityWarning,
  inactivityTimeRemaining
}}>
{children}
</AuthContext.Provider>
);
}