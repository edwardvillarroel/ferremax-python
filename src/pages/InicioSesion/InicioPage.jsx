import { Button, Container, Form } from 'react-bootstrap';
import './InicioPage.css'
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../InicioSesion/authContext';
import Swal from 'sweetalert2';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { testConnection } from '../../api';

const InicioPage = () => {
  const [showPassword, setPasword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esEmpleado, setEsEmpleado] = useState(false); // Nuevo estado
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState('');
  const { login, loginWithGoogle } = useContext(AuthContext);

  const paswordShow = () => setPasword(!showPassword);

  const handleglogin = async (e) => {
    e.preventDefault();

    // Cambia el endpoint según el tipo de usuario
    const endpoint = esEmpleado
      ? 'http://localhost:5000/api/login-empleado'
      : 'http://localhost:5000/api/login';

    try {
      const res = await fetch(`${endpoint}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Detecta si es admin por el campo cargo (puede ser string o número)
        const esAdmin = data.user.cargo === 1 || data.user.cargo === "1";
        login(data.token, esAdmin ? 'admin' : data.rol, data.user);

        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido ${data.user.name} ${data.user.lastname}!`,
          confirmButtonColor: '#00bcd4',
        }).then(() => {
          navigate(esAdmin ? '/admin' : '/');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
          text: data.message || 'Correo o contraseña inválidos',
          confirmButtonColor: '#00bcd4',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor',
        confirmButtonColor: '#00bcd4',
      });
      console.error(err);
    }
  };

  const handleGoogleLogin = (credentialResponse) => {
    const decored = jwtDecode(credentialResponse.credential);
    const nombre = decored.name;
    const email = decored.email;

    const token = credentialResponse.credential;
    const esAdmin = email === 'admin@admin.com';

    loginWithGoogle(token, nombre, email);

    Swal.fire({
      icon: 'success',
      title: `¡Bienvenido ${esAdmin ? 'administrador' : nombre}!`,
      confirmButtonColor: '#00bcd4',
    }).then(() => {
      navigate(esAdmin ? '/admin' : '/');
    });
  };

  const handleGoogleLoginError = () => {
    Swal.fire({
      icon: 'error',
      title: 'Error al iniciar sesión con Google',
      confirmButtonColor: '#00bcd4',
    });
  };

  useEffect(() => {
    const userAdmin = {
      nombre: 'administrador',
      email: 'admin@admin.com',
      password: 'admin123'
    };

    if (!localStorage.getItem('usuario')) {
      localStorage.setItem('usuario', JSON.stringify(userAdmin));
    }
  }, []);

  return (
    <Container className="div-contenedor">
      <div className="formulario-custom">
        <Form onSubmit={handleglogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <h3>¿Ya tienes una cuenta con nosotros?</h3>
            <p>Si ya tienes una cuenta, inicia sesión con tu correo electrónico y contraseña.</p>
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCheckbox">
            <Form.Check
              type="checkbox"
              label="Mostrar contraseña"
              onChange={paswordShow} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmpleado">
            <Form.Check
              type="checkbox"
              label="Iniciar como empleado"
              checked={esEmpleado}
              onChange={() => setEsEmpleado(!esEmpleado)}
            />
          </Form.Group>

          <Button className='buttonInicio' type="submit">Iniciar Sesión</Button>
          <p className='passwordRes'>¿Olvidaste tu contraseña?</p>
        </Form>

        <div className="mt-3 text-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleLoginError} />
        </div>
      </div>

      <div className="formulario-custom2">
        <Form>
          <Form.Group className="mb-3" controlId="">
            <h4>Clientes Nuevos</h4>
            <p>Si ya tienes una cuenta, inicia sesión con tu correo electrónico y contraseña.</p>
          </Form.Group>
          <Button className='buttonLog' variant="primary" type="submit" as={Link} to="/registro">
            Crear una Cuenta
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export default InicioPage;