import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBoxes, FaUsersCog, FaChartLine, FaChartBar, FaBullhorn } from 'react-icons/fa';
import './Admin.css';

function AdminPage() {
  const navigate = useNavigate();
  return (
    <Container className="admin-panel mt-5">
      <h1 className="text-center mb-5">Panel de Administración</h1>
      <Row className="justify-content-center g-4">
        <Col xs={12} md={6} lg={4}>
          <Card className="admin-option shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <FaBoxes size={48} className="mb-3 text-primary" />
              <Card.Title className="mb-3 fw-bold">Gestión de inventario</Card.Title>
              <Card.Text className="text-center">
                Administra productos, stock y categorías del inventario.
              </Card.Text>
              <Button variant="primary" className="mt-auto w-100" onClick={() => navigate('/admin/inventario')}>
                Ir a Inventario
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="admin-option shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <FaUsersCog size={48} className="mb-3 text-secondary" />
              <Card.Title className="mb-3 fw-bold">Administración de empleados</Card.Title>
              <Card.Text className="text-center">
                Gestiona usuarios, roles y permisos del personal.
              </Card.Text>
              <Button variant="secondary" className="mt-auto w-100" onClick={() => navigate('/admin/empleados')}>
                Ir a Empleados
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="admin-option shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <FaChartLine size={48} className="mb-3 text-info" />
              <Card.Title className="mb-3 fw-bold">Informes de ventas</Card.Title>
              <Card.Text className="text-center">
                Genera y revisa informes de ventas mensuales.
              </Card.Text>
              <Button variant="info" className="mt-auto w-100 text-white">
                Ver informes de ventas
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="admin-option shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <FaChartBar size={48} className="mb-3 text-warning" />
              <Card.Title className="mb-3 fw-bold">Informes de desempeño</Card.Title>
              <Card.Text className="text-center">
                Consulta el desempeño general de la tienda.
              </Card.Text>
              <Button variant="warning" className="mt-auto w-100">
                Ver desempeño
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="admin-option shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <FaBullhorn size={48} className="mb-3 text-success" />
              <Card.Title className="mb-3 fw-bold">Estrategias y promociones</Card.Title>
              <Card.Text className="text-center">
                Crea y gestiona promociones y estrategias de ventas.
              </Card.Text>
              <Button variant="success" className="mt-auto w-100">
                Gestionar promociones
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default AdminPage;