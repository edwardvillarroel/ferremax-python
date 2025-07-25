import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import BtnAddCard from '../../../btnAddCard';
import './TornillosPage.css';
import Swal from 'sweetalert2';
import { useCarrito } from '../../Carrito/CarritoContext';
import { useCurrency } from '../../../contexts/MonedaContext';

const extractRealBase64 = (encodedString) => {
    try {
        const decoded = atob(encodedString);
        const match = decoded.match(/data:image\/([^;]+);base64,([^)]+)/);
        if (match) {
            return {
                type: match[1],
                base64: match[2]
            };
        }
    } catch (error) {
        return null;
    }
    return null;
};

const renderProductImage = (producto) => {
    if (!producto.img_prod) {
        return process.env.PUBLIC_URL + '/imagenes/unaviable.jpg';
    }
    if (producto.img_prod.startsWith('data:image/')) {
        return producto.img_prod;
    }
    const realImageData = extractRealBase64(producto.img_prod.trim());
    if (!realImageData) {
        return process.env.PUBLIC_URL + '/imagenes/unaviable.jpg';
    }
    return `data:image/${realImageData.type};base64,${realImageData.base64}`;
};

const TornillosPage = () => {
    const { agregarAlCarrito } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { formatPrice } = useCurrency(); 

    // Estados para los filtros
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Estados para los rangos de precios
    const [precioMinBD, setPrecioMinBD] = useState(0);
    const [precioMaxBD, setPrecioMaxBD] = useState(0);

    const handleAddToCart = (producto) => {
        const productoConImagen = {
            ...producto,
            img_prod: renderProductImage(producto) //sobrescribe img_prod con versión formateada
        };

        agregarAlCarrito(productoConImagen);

        Swal.fire({
            title: 'Producto agregado',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
            }
        });
    };



    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Cargar productos
                const response = await axios.get('http://localhost:5000/api/productos');

                if (response.data.success) {
                    // Filtrar solo tornillos (id_categoria = 5)
                    const tornillos = response.data.data.filter(
                        p => p.id_categoria === 5
                    );

                    setProductos(tornillos);
                    setProductosFiltrados(tornillos);

                    // Calcular rangos de precio
                    if (tornillos.length > 0) {
                        const precios = tornillos.map(p => p.precio);
                        setPrecioMinBD(Math.min(...precios));
                        setPrecioMaxBD(Math.max(...precios));
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los tornillos. Intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar productos cuando cambien los filtros
    useEffect(() => {
        let resultados = [...productos];

        // Filtrar por precio
        if (precioMin) {
            resultados = resultados.filter(p => p.precio >= parseFloat(precioMin));
        }

        if (precioMax) {
            resultados = resultados.filter(p => p.precio <= parseFloat(precioMax));
        }

        // Filtrar por búsqueda
        if (busqueda) {
            const termino = busqueda.toLowerCase();
            resultados = resultados.filter(p =>
                p.nom_prod.toLowerCase().includes(termino) ||
                p.marca.toLowerCase().includes(termino) ||
                p.descr_prod.toLowerCase().includes(termino)
            );
        }

        setProductosFiltrados(resultados);
    }, [productos, precioMin, precioMax, busqueda]);

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setPrecioMin('');
        setPrecioMax('');
        setBusqueda('');
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando productos...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center my-5">
                <div className="alert alert-danger">{error}</div>
            </Container>
        );
    }

    return (
        <Container className="tornillos-container py-4">
            <h1 className="text-center mb-5">Tornillos</h1>

            {/* Filtros */}
            <Card className="p-3 mb-4">
                <Row>
                    {/* Búsqueda por texto */}
                    <Col md={5}>
                        <label className="form-label">Buscar tornillos:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre, marca o descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </Col>

                    {/* Filtros de precio */}
                    <Col md={2}>
                        <label className="form-label">Precio Mín:</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder={`Mín: $${precioMinBD}`}
                            min={precioMinBD}
                            max={precioMaxBD}
                            value={precioMin}
                            onChange={(e) => setPrecioMin(e.target.value)}
                        />
                    </Col>

                    <Col md={2}>
                        <label className="form-label">Precio Máx:</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder={`Máx: $${precioMaxBD}`}
                            min={precioMinBD}
                            max={precioMaxBD}
                            value={precioMax}
                            onChange={(e) => setPrecioMax(e.target.value)}
                        />
                    </Col>

                    <Col md={3} className="d-flex align-items-end">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={limpiarFiltros}
                        >
                            Limpiar Filtros
                        </button>
                    </Col>
                </Row>
            </Card>

            {/* Contador de resultados */}
            <div className="mb-3">
                <p className="text-muted">
                    Mostrando {productosFiltrados.length} tornillo{productosFiltrados.length !== 1 ? 's' : ''}
                    {busqueda && ` para "${busqueda}"`}
                </p>
            </div>

            {/* Resultados */}
            <Row>
      {Array.isArray(productos) && productos.length > 0 ? (
        productos.map((producto) => (
          <Col key={producto.id_producto} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card className="cardPromocion">
              <Card.Img
                variant="top"
                src={renderProductImage(producto)}
                alt={producto.nom_prod}
              />
              <div className="card-divider" />
              <Card.Body className="card-body-custom">
                <Card.Title className="card-title">{producto.nom_prod}</Card.Title>
                <Card.Subtitle>{producto.marca}</Card.Subtitle>
                <Card.Text>
                  <span className="current-price">{formatPrice(producto.precio)}</span>
                  <p className="description">{producto.descr_prod}</p>
                  <span className="stock">Stock: {producto.stock} unidades</span>
                </Card.Text>
                <div >
                  <BtnAddCard
                    producto={producto}
                    handleAddToCart={handleAddToCart}
                    className="button-card"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))
      ) : (
        <p>No hay productos disponibles</p>
      )}
    </Row>
        </Container>
    );
};

export default TornillosPage;
