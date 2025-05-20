import { createContext, useState, useEffect} from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [rol, setRol] = useState(null);
   const [user, setUser] = useState(null);

    useEffect(()=>{
    const token = localStorage.getItem('token');
    const userRol = localStorage.getItem('rol');
    const userData = JSON.parse(localStorage.getItem('user'));

    if((token || userData) && userRol && userData?.name && user.userData?.email){
      setIsLoggedIn(true);
      setRol(userRol);
      setUser({name: userData.name, email: userData.email});
    }},[user]);

   const login = (token, userRol) => {
    const userData = JSON.parse(localStorage.getItem('usuario'))

    if(userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('rol', userRol);
      localStorage.setItem('user', JSON.stringify({ name: userData.nombre, email: userData.email }));

      setIsLoggedIn(true);
      setRol(userRol);
      setUser({ name: userData.nombre, email: userData.email });
    }  
   };

   const loginWithGoogle = async (response) => {
   const { email, name } = response.profileObj;

   const isAdmin = email === 'admin@admin.com';

   setUser({ name, email });
   setIsLoggedIn(true);
   setRol(isAdmin ? 'admin' : 'cliente');

   localStorage.setItem('user', JSON.stringify({ name, email }));
   localStorage.setItem('rol', isAdmin ? 'admin' : 'cliente');
   localStorage.setItem('isLoggedIn', true);
  };

   const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setRol(null);
    setUser(null);
   };

   return(
    <AuthContext.Provider value={ {isLoggedIn, rol, login, logout, user, loginWithGoogle}}>
      {children}
    </AuthContext.Provider>
   );
};


