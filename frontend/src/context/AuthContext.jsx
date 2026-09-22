import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for auth state changes in Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch fresh ID Token & store in localStorage for backend requests
        const idToken = await user.getIdToken();
        localStorage.setItem('firebaseToken', idToken);
        setCurrentUser(user);
      } else {
        localStorage.removeItem('firebaseToken');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Firebase Sign In Handler
  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await res.user.getIdToken();
    localStorage.setItem('firebaseToken', idToken);
    return res.user;
  };

  // 3. Firebase Sign Out Handler
  const logout = () => {
    localStorage.removeItem('firebaseToken');
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);