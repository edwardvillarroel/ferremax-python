import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rol, setRol] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRol = localStorage.getItem('rol');
    const userData = JSON.parse(localStorage.getItem('user'));

    if ((token || userData) && userRol && userData?.name && userData?.email) {
      setIsLoggedIn(true);
      setRol(userRol);
      setUser({
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email
      });
    }
  }, []);

  // Ahora login recibe el usuario real desde el backend
  const login = (token, userRol, userData) => {
    // userData debe tener { name, lastname, email }
    const userToStore = {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email
    };

    localStorage.setItem('token', token);
    localStorage.setItem('rol', userRol);
    localStorage.setItem('user', JSON.stringify(userToStore));

    setIsLoggedIn(true);
    setRol(userRol);
    setUser(userToStore);
  };

  const loginWithGoogle = async (token, nombre, email, lastname = '') => {
    const isAdmin = email === 'admin@admin.com';
    const userToStore = { name: nombre, lastname, email };

    setUser(userToStore);
    setIsLoggedIn(true);
    setRol(isAdmin ? 'admin' : 'cliente');

    localStorage.setItem('user', JSON.stringify(userToStore));
    localStorage.setItem('rol', isAdmin ? 'admin' : 'cliente');
    localStorage.setItem('token', token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setRol(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, rol, login, logout, user, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};