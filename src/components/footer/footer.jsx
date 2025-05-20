import { Container, Row, Col, Image, Nav } from "react-bootstrap";
import './footer.css'
import { AiOutlineWhatsApp } from "react-icons/ai";

function FooterFerremax() {
  return (
    <footer>
      <Container fluid>   
        <Row className="footer-row text-black py-4">
          <Col className="footer-column">
            <Image
              src="/imagenes/logo-ferrema.png"
              alt="Logo"
              rounded
              width={100}
              height={40}
              className="logo-footer"
            />
            <h5 className="footer-heading">Casa Matriz</h5>
            <Nav className="footer-nav">
              <Nav.Link>Av. Monte Pilato 5210, Limache, Región de Valparaíso</Nav.Link>
              <Nav.Link>
                <AiOutlineWhatsApp className="whats-icon" /> +56960608989
              </Nav.Link>
            </Nav>
            <div className="payment-logo">
              <Image
                src="/imagenes/webpayyy.png"
                alt="WebPay"
                rounded
                width={100}
                height={40}
              />
            </div>
          </Col>

          <Col className="footer-column">
            <h5 className="footer-heading1">Nosotros</h5>
            <Nav className="footer-nav">
              <Nav.Link href="#">Quiénes somos</Nav.Link>
              <Nav.Link href="#">Tiendas</Nav.Link>
            </Nav>
          </Col>

          <Col className="footer-column">
            <h5 className="footer-heading1">Ayuda</h5>
            <Nav className="footer-nav">
              <Nav.Link href="#">¿Cómo comprar?</Nav.Link>
              <Nav.Link href="#">Condiciones de despacho</Nav.Link>
              <Nav.Link href="#">Seguimiento de compra</Nav.Link>
            </Nav>
          </Col>

          <Col className="footer-column">
            <h5 className="footer-heading1">Categorías</h5>
            <Nav className="footer-nav">
              <Nav.Link href="#">Herramientas de Construcción</Nav.Link>
              <Nav.Link href="#">Equipos de industria y taller</Nav.Link>
              <Nav.Link href="#">Aseo y jardín</Nav.Link>
              <Nav.Link href="#">Insumos y accesorios</Nav.Link>
              <Nav.Link href="#">Pintura</Nav.Link>
            </Nav>
          </Col>

          <Col className="footer-column">
            <h5 className="footer-heading1">Legal</h5>
            <Nav className="footer-nav">
              <Nav.Link href="#">Términos y condiciones</Nav.Link>
              <Nav.Link href="#">Política de garantía y devoluciones</Nav.Link>
              <Nav.Link href="#">Política de cookies</Nav.Link>
              <Nav.Link href="#">Política de privacidad</Nav.Link>
            </Nav>
          </Col>
        </Row>

        <Row className="footer-row text-black py-4">
          <Col className="text-center">
            <hr className="footer-divider" />
            <p className="footer-copy">
              ©{new Date().getFullYear()} Ferremas - Todos los derechos reservados
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}



export default FooterFerremax;
