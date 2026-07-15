/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const localAdmin = localStorage.getItem('localAdminUser');
    return localAdmin ? JSON.parse(localAdmin) : null;
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('localAdminRole') || null;
  });
  const [userData, setUserData] = useState(() => {
    const localData = localStorage.getItem('localAdminData');
    return localData ? JSON.parse(localData) : null;
  });
  const [loading, setLoading] = useState(true);

  // Lookup the real email address associated with a USN or Faculty Admin ID
  const getEmailByUsnOrId = async (id, role) => {
    const cleanId = id.trim().toUpperCase();
    const usersRef = collection(db, 'users');
    const field = role === 'admin' ? 'adminId' : 'usn';
    
    const q = query(usersRef, where(field, '==', cleanId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      if (data.email) {
        return data.email;
      }
      // Fallback for older accounts registered before the email update
      const rawId = id.trim().toLowerCase();
      if (role === 'admin') {
        return `${rawId}@admin.semesternotes.local`;
      }
      return `${rawId}@semesternotes.local`;
    }
    throw new Error(`No account found with this ${role === 'admin' ? 'Faculty Admin ID' : 'USN'}.`);
  };

  const login = async (id, password, role) => {
    if (role === 'admin') {
      const cleanId = id.trim().toLowerCase();
      if (cleanId === 'admin' && password === 'admin@123') {
        const fakeUser = { uid: 'admin-local-uid', email: 'admin@semesternotes.local' };
        const fakeData = { name: 'Admin', role: 'admin', email: 'admin@semesternotes.local', adminId: 'ADMIN' };
        
        localStorage.setItem('localAdminUser', JSON.stringify(fakeUser));
        localStorage.setItem('localAdminRole', 'admin');
        localStorage.setItem('localAdminData', JSON.stringify(fakeData));

        setCurrentUser(fakeUser);
        setUserRole('admin');
        setUserData(fakeData);
        return fakeUser;
      } else {
        throw new Error('Invalid Admin credentials.');
      }
    }

    // 1. Get the real registered email address first
    const email = await getEmailByUsnOrId(id, role);
    
    // 2. Perform Firebase Auth Sign In
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // 3. Fetch user details from Firestore to verify role matches
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role !== role) {
        // Role mismatch logic
        await signOut(auth);
        throw new Error(`Role mismatch. This account is registered as a ${data.role}.`);
      }
      setUserRole(data.role);
      setUserData(data);
    } else {
      await signOut(auth);
      throw new Error('User record not found in database.');
    }
    return userCredential.user;
  };

  const signUp = async (id, password, role, name, email, adminSecret) => {
    if (role === 'admin') {
      const actualSecret = 'ADMIN_SECRET_2026';
      if (adminSecret !== actualSecret) {
        throw new Error('Invalid Faculty Verification Key.');
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    // 2. Build User Profile
    const userProfile = {
      uid: user.uid,
      name: name.trim(),
      email: cleanEmail,
      role: role,
      createdAt: new Date().toISOString(),
    };

    if (role === 'admin') {
      userProfile.adminId = id.trim().toUpperCase();
    } else {
      userProfile.usn = id.trim().toUpperCase();
    }

    // 3. Save User Profile in Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    setUserRole(role);
    setUserData(userProfile);
    return user;
  };

  const resetPassword = async (id, role) => {
    // Get the real email associated with this USN/Admin ID
    const email = await getEmailByUsnOrId(id, role);
    
    // Trigger Firebase password reset email
    await sendPasswordResetEmail(auth, email);
    return email; // Return the email address so the client can show a success message
  };

  const logout = async () => {
    localStorage.removeItem('localAdminUser');
    localStorage.removeItem('localAdminRole');
    localStorage.removeItem('localAdminData');
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const localAdmin = localStorage.getItem('localAdminUser');
      if (localAdmin) {
        setLoading(false);
        return;
      }

      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserData(data);
          } else {
            console.error('No Firestore document found for authenticated user');
            setUserRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user document from Firestore:', error);
          setUserRole(null);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    loading,
    login,
    signUp,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
