import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import { syncFirebaseUser } from '../components/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        // Set Firebase user
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        });

        // Sync with MongoDB
        try {
          const response = await syncFirebaseUser(
            user.uid, 
            user.displayName || user.email?.split('@')[0] || 'User', 
            user.email
          );
          setMongoUser(response.data.user);
          console.log('User synced with MongoDB:', response.data.user);
        } catch (error) {
          console.error('Failed to sync user with MongoDB:', error);
        }
      } else {
        setUser(null);
        setMongoUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setMongoUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    mongoUser,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
