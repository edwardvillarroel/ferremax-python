import { Container, Nav, Navbar, NavDropdown, Image, Button, Overlay, Popover } from 'react-bootstrap';
import './Nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai';
import { useState, useRef, useContext} from 'react';
import { AuthContext } from '../../pages/InicioSesion/authContext';
import Swal from 'sweetalert2';


function NavbarF() {
  const { isLoggedIn, rol, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPopover, setShowPopover] = useState(false);
  const popoverTarget = useRef(null);

  const cerrarSesion = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Vas a cerrar sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) =>{
      if(result.isConfirmed){
        logout();
        navigate('/Home');
        Swal.fire({
        title: 'Sesión cerrada',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500});
      }
    });
  }

  return (
    <>
      <Navbar collapseOnSelect expand="lg" className="bg-dark custom-navbar" variant="dark">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <div className="d-lg-none">
            <Navbar.Toggle aria-controls="responsive-navbar-nav" className="custom-toggle" />
          </div>
          <Navbar.Brand className="nav-logo" as={Link} to="/Home">
            <Image 
              src="/imagenes/logo-ferrema.png"
              alt="Logo"
              width={200}
              className="header-logo"   
            />
          </Navbar.Brand>

          <div className="d-flex align-items-center order-lg-2">
            <div className="d-none d-lg-flex align-items-center me-3">
              {isLoggedIn && (<span className="text-white me-3 d-flex align-items-center">
                <AiOutlineUser className="user-icon me-1"/>
                {rol === 'admin' ? 'Administrador' : user?.name || 'Usuario'}</span>)}

              <Nav className="align-items-center">
                {!isLoggedIn ?(
                 <>
                  <Nav.Link as={Link} to="/inicio" className="d-inline-flex align-items-center">
                  <AiOutlineUser className="user-icon me-1" />Inicia sesión</Nav.Link>
                  <Nav.Link as={Link} to="/registro">Regístrate</Nav.Link></>) : 
                  (<Button className='btn-salir' onClick={cerrarSesion}>Cerrar Sesión</Button>)}
              </Nav> 
            </div>

            {rol !== 'admin' &&(
            <div className="cart-icon-container ms-3">
              <Button
                variant="link"
                ref={popoverTarget}
                onClick={() => setShowPopover(!showPopover)}
                className="p-0 border-0 bg-transparent"
              >
                <AiOutlineShoppingCart className="cart-icon" />
              </Button>

              <Overlay className="overlay-custom" target={popoverTarget.current} show={showPopover} placement="bottom">
                {(props) => (
                  <Popover {...props}>
                    <Popover.Header as="h3">Carrito de compras</Popover.Header>
                    <Popover.Body>No hay articulos
                      
                    </Popover.Body>
                  </Popover>
                )}
              </Overlay>
            </div>
            )}
          </div>

          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mx-auto text-center d-flex flex-wrap justify-content-center align-items-center nav-links-container">
              <NavDropdown title="Herramientas" id="collapsible-nav-dropdown">
                <NavDropdown.Item as={Link} to="/Herramientas-Manuales" id="tools1">Herramientas Manuales</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Materiales-Basicos" id="tools2">Materiales Básicos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Equipo-de-seguridad" id="tools3">Equipos de Seguridad</NavDropdown.Item>
              </NavDropdown>
                <Nav.Link as={Link} to="/tornillos" id="tools4">Tornillos</Nav.Link>
                <Nav.Link as={Link} to="/fijaciones" id="tools5">Fijaciones</Nav.Link>
                <Nav.Link as={Link} to="/equipos-de-medicion" id="tools6">Equipos de Medición</Nav.Link>

              {rol === 'admin' && (
                <NavDropdown title="Administración" id="admin-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/usuarios">Gestión de usuarios</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/productos">Control de inventariosc</NavDropdown.Item>
                </NavDropdown>)}

              <div className="auth-links-inline d-lg-none d-flex align-items-center ms-3">
                <Nav.Link as={Link} to="/inicio" className="d-inline-flex align-items-center">
                <AiOutlineUser className="user-icon me-1" />Inicia sesión</Nav.Link>
                <Nav.Link as={Link} to="/registro">Regístrate</Nav.Link>
              </div>
           </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarF;
