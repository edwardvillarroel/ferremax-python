import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';

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

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Marca</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.idProducto}>
                            <td>{producto.idProducto}</td>
                            <td>{producto.nombreProducto}</td>
                            <td>{producto.descripcion}</td>
                            <td>${producto.precio}</td>
                            <td>{producto.marca}</td>
                            <td>{producto.cantidadDisponible}</td>
                            <td>{producto.categoriaDescripcion}</td>
                            <td>
                                <Button variant="info" size="sm" className="me-2" >
                                    Editar
                                </Button>
                                <Button variant="danger" size="sm" >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

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