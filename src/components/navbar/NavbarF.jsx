import { Container, Nav, Navbar, NavDropdown, Image, Button } from 'react-bootstrap';
import './Nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai';
import { useState, useContext } from 'react';
import { useCurrency } from '../../contexts/MonedaContext';
import { AuthContext } from '../../pages/InicioSesion/authContext';
import Swal from 'sweetalert2';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { useCarrito } from '../../pages/Carrito/CarritoContext';  // Importa el contexto del carrito

function NavbarF() {
  const { isLoggedIn, rol, logout, user } = useContext(AuthContext);
  const { currentCurrency, changeCurrency, loading } = useCurrency();
  const { obtenerCantidadTotal } = useCarrito();  // Obtén la función para obtener la cantidad total
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const handleSelect = async (eventKey) => {
    await changeCurrency(eventKey);
  };

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
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/Home');
        Swal.fire({
          title: 'Sesión cerrada',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  const irAlCarrito = () => {
    navigate('/TuCarrito');
  };

  const cantidadProductos = obtenerCantidadTotal();  // Ahora obtiene la cantidad total de productos

  return (
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
            {isLoggedIn && (
              <span className="text-white me-3 d-flex align-items-center">
                <AiOutlineUser className="user-icon me-1" />
                {`${user?.name ?? ''} ${user?.lastname ?? ''}`.trim() || 'Usuario'}
              </span>
            )}

            <Nav className="align-items-center">
              {!isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/inicio" className="d-inline-flex align-items-center">
                    <AiOutlineUser className="user-icon me-1" />Inicia sesión</Nav.Link>
                  <Nav.Link as={Link} to="/registro">Regístrate</Nav.Link>
                </>
              ) : (
                <Button className='btn-salir' onClick={cerrarSesion}>Cerrar Sesión</Button>
              )}
              <Dropdown as={ButtonGroup} onSelect={handleSelect}>
                <Button variant="success" disabled={loading}>
                  {loading ? 'Cargando...' : currentCurrency}
                </Button>
                <Dropdown.Toggle split variant="success" id="dropdown-split-basic" disabled={loading} />
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="CLP">CLP (Peso Chileno)</Dropdown.Item>
                  <Dropdown.Item eventKey="ARS">ARS (Peso Argentino)</Dropdown.Item>
                  <Dropdown.Item eventKey="BOL">BOL (Boliviano)</Dropdown.Item>
                  <Dropdown.Item eventKey="BRL">BRL (Real Brasileño)</Dropdown.Item>
                  <Dropdown.Item eventKey="EUR">EUR (Euro)</Dropdown.Item>
                  <Dropdown.Item eventKey="USD">USD (Dólar)</Dropdown.Item>
                  <Dropdown.Item eventKey="PEN">PEN (Sol Peruano)</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </div>

          {rol !== 'admin' && (
            <div className="cart-icon-container ms-3">
              <Button
                variant="link"
                onClick={irAlCarrito}  // Redirige al carrito al hacer clic
                className="p-0 border-0 bg-transparent"
              >
                <AiOutlineShoppingCart className="cart-icon" />
                {cantidadProductos > 0 && (
                  <span className="cart-badge">{cantidadProductos}</span>
                )}
              </Button>
            </div>
          )}
        </div>

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mx-auto text-center d-flex flex-wrap justify-content-center align-items-center nav-links-container">
            <NavDropdown
              title="Herramientas"
              id="collapsible-nav-dropdown"
              to="/herramientas"
              show={showToolsDropdown}
              onMouseEnter={() => setShowToolsDropdown(true)}
              onMouseLeave={() => setShowToolsDropdown(false)}
              onToggle={() => { }}
              onClick={() => navigate('/herramientas')}
            >
              <NavDropdown.Item
                as={Link}
                to="/herramientas-manuales"
                id="tools1"
                onClick={() => setShowToolsDropdown(false)}
              >
                Herramientas Manuales
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/materiales-Basicos"
                id="tools2"
                onClick={() => setShowToolsDropdown(false)}
              >
                Materiales Básicos
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to="/equipos-de-seguridad"
                id="tools3"
                onClick={() => setShowToolsDropdown(false)}
              >
                Equipos de Seguridad
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/tornillos" id="tools4">Tornillos</Nav.Link>
            <Nav.Link as={Link} to="/fijaciones" id="tools5">Fijaciones</Nav.Link>
            <Nav.Link as={Link} to="/equipos-de-medicion" id="tools6">Equipos de Medición</Nav.Link>

            {rol === 'admin' && (
              <NavDropdown
                title="Administración"
                id="admin-nav-dropdown"
                show={showDropdown}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
                onToggle={() => { }}
                onClick={() => navigate('/admin')}
              >
                <NavDropdown.Item
                  as={Link}
                  to="/admin/empleados"
                  onClick={() => setShowDropdown(false)}
                >
                  Gestión de empleados
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  to="/admin/inventario"
                  onClick={() => setShowDropdown(false)}
                >
                  Control de inventario
                </NavDropdown.Item>
              </NavDropdown>
            )}

            <div className="auth-links-inline d-lg-none d-flex align-items-center ms-3">
              <Nav.Link as={Link} to="/inicio" className="d-inline-flex align-items-center">
                <AiOutlineUser className="user-icon me-1" />Inicia sesión</Nav.Link>
              <Nav.Link as={Link} to="/registro">Regístrate</Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarF;
