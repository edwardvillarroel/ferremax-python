import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import axios from 'axios';

function GestionPromociones() {
  const [promociones, setPromociones] = useState([
    { id: 1, producto: { id: 1, nom_prod: 'Martillo' }, descripcion: '15% descuento en este producto', vigencia: '01/07/2025 - 15/07/2025' },
  ]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [form, setForm] = useState({ descripcion: '', fechaInicio: '', fechaFin: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    // Cargar productos desde el endpoint
    axios.get('http://localhost:5000/api/productos')
      .then(res => {
        if (res.data.success) setProductos(res.data.data);
      });
  }, []);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setProductoSeleccionado(null);
  };

  const handleSelectProducto = (prod) => {
    setProductoSeleccionado(prod);
    setBusqueda(prod.nom_prod);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    const vigencia = form.fechaInicio && form.fechaFin ? `${form.fechaInicio} - ${form.fechaFin}` : '';
    if (editId) {
      setPromociones(promociones.map(p => p.id === editId ? { ...p, producto: productoSeleccionado, descripcion: form.descripcion, vigencia } : p));
      setEditId(null);
    } else {
      setPromociones([
        ...promociones,
        { id: promociones.length + 1, producto: productoSeleccionado, descripcion: form.descripcion, vigencia },
      ]);
    }
    setProductoSeleccionado(null);
    setBusqueda('');
    setForm({ descripcion: '', fechaInicio: '', fechaFin: '' });
  };

  const handleEdit = (promo) => {
    setEditId(promo.id);
    setProductoSeleccionado(promo.producto);
    setBusqueda(promo.producto.nom_prod);
    // Extraer fechas de vigencia si existen
    let fechaInicio = '', fechaFin = '';
    if (promo.vigencia && promo.vigencia.includes(' - ')) {
      [fechaInicio, fechaFin] = promo.vigencia.split(' - ');
    }
    setForm({ descripcion: promo.descripcion, fechaInicio, fechaFin });
  };

  const handleDelete = (id) => {
    setPromociones(promociones.filter(p => p.id !== id));
  };

  // Filtrar productos para autocompletar
  const productosFiltrados = busqueda.length > 0
    ? productos.filter(p => p.nom_prod.toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Gestión de Promociones</h2>
      <Row>
        <Col md={5}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{editId ? 'Editar promoción' : 'Crear nueva promoción'}</Card.Title>
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3" style={{ position: 'relative' }}>
                  <Form.Label>Producto</Form.Label>
                  <Form.Control
                    name="producto"
                    value={busqueda}
                    onChange={handleBusqueda}
                    placeholder="Buscar producto..."
                    autoComplete="off"
                    required
                  />
                  {busqueda && productosFiltrados.length > 0 && !productoSeleccionado && (
                    <div style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #ccc', width: '100%' }}>
                      {productosFiltrados.slice(0, 5).map(prod => (
                        <div
                          key={prod.id_prod}
                          style={{ padding: '5px', cursor: 'pointer' }}
                          onClick={() => handleSelectProducto(prod)}
                        >
                          {prod.nom_prod}
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: 15% descuento en este producto"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Vigencia</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="date"
                        name="fechaInicio"
                        value={form.fechaInicio}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="date"
                        name="fechaFin"
                        value={form.fechaFin}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Button type="submit" variant="success" className="w-100 mb-2">{editId ? 'Guardar cambios' : 'Crear promoción'}</Button>
                <Button type="button" variant="secondary" className="w-100" onClick={() => {
                  setEditId(null);
                  setProductoSeleccionado(null);
                  setBusqueda('');
                  setForm({ descripcion: '', fechaInicio: '', fechaFin: '' });
                }}>Limpiar</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card>
            <Card.Body>
              <Card.Title>Promociones existentes</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Descripción</th>
                    <th>Vigencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promociones.map((promo) => (
                    <tr key={promo.id}>
                      <td>{promo.id}</td>
                      <td>{promo.producto?.nom_prod || ''}</td>
                      <td>{promo.descripcion}</td>
                      <td>{promo.vigencia}</td>
                      <td>
                        <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(promo)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(promo.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default GestionPromociones;
