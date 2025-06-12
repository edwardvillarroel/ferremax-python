import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Modal, Card, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../../components/desarrollo/desarrollo.css';

function ProductoPage() {
    const [productos, setProductos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        nombreProducto: '',
        descripcion: '',
        precio: '',
        marca: '',
        cantidadDisponible: '',
        categoriaId: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const resetForm = () => {
        setFormData({
            nombreProducto: '',
            descripcion: '',
            precio: '',
            marca: '',
            cantidadDisponible: '',
            categoriaId: ''
        });
        setSelectedProduct(null);
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Productos</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Nuevo Producto
                </Button>
            </div>

            {/* Grid Responsivo de Productos */}
            <Row>
                {productos.length > 0 ? (
                    productos.map((producto) => (
                        <Col key={producto.idProducto} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="cardPromocion h-100">
                                <div className="card-divider" />
                                <Card.Body className="card-body-custom">
                                    <div className="mb-2">
                                        <small className="text-muted">ID: {producto.idProducto}</small>
                                    </div>
                                    
                                    <Card.Title className="card-title mb-2">{producto.nombreProducto}</Card.Title>
                                    
                                    <Card.Text>
                                        <p className="description">{producto.descripcion}</p>
                                        
                                        <span className="current-price">${producto.precio}</span>
                                        
                                        <div className="mb-2 mt-2">
                                            <small className="text-muted">
                                                <strong>Marca:</strong> {producto.marca}
                                            </small>
                                        </div>
                                        
                                        <span className="stock">Stock: {producto.cantidadDisponible} unidades</span>
                                        
                                        <div className="mb-2 mt-1">
                                            <small className="text-muted">
                                                <strong>Categoría:</strong> {producto.categoriaDescripcion}
                                            </small>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <h5 className="text-muted">No hay productos disponibles</h5>
                        <p className="text-muted">Haz clic en "Nuevo Producto" para comenzar</p>
                    </Col>
                )}
            </Row>

            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                resetForm();
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombreProducto"
                                value={formData.nombreProducto}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                type="text"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Marca</Form.Label>
                            <Form.Control
                                type="text"
                                name="marca"
                                value={formData.marca}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                type="number"
                                name="cantidadDisponible"
                                value={formData.cantidadDisponible}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Categoría ID</Form.Label>
                            <Form.Control
                                type="number"
                                name="categoriaId"
                                value={formData.categoriaId}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit">
                                {selectedProduct ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ProductoPage;