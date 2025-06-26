import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import BtnAddCard from '../../btnAddCard';
import './HerramientasPage.css';
import Swal from 'sweetalert2';
import { useCarrito } from '../Carrito/CarritoContext';


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


const HerramientasPage = () => {
    const { agregarAlCarrito } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias] = useState([
        { id_categoria: 1, nom_cat: 'Herramientas' },
        { id_categoria: 2, nom_cat: 'Herramientas Manuales' },
        { id_categoria: 3, nom_cat: 'Materiales Básicos' }
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

    // Estados para los rangos de precios
    const [precioMinBD, setPrecioMinBD] = useState(0);
    const [precioMaxBD, setPrecioMaxBD] = useState(0);

    // Función para obtener el nombre de la categoría
    const getNombreCategoria = useCallback((idCategoria) => {
        const categoria = categorias.find(cat => cat.id_categoria === idCategoria);
        return categoria ? categoria.nom_cat : 'Categoría Desconocida';
    }, [categorias]);

    const handleAddToCart = (producto) => {
        const productoConImagen = {
            ...producto,
            img_prod: renderProductImage(producto)
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
                    // Filtrar solo herramientas (categorías 1-3)
                    const herramientas = response.data.data.filter(
                        p => p.id_categoria >= 1 && p.id_categoria <= 3
                    );

                    setProductos(herramientas);
                    setProductosFiltrados(herramientas);

                    // Calcular rangos de precio
                    if (herramientas.length > 0) {
                        const precios = herramientas.map(p => p.precio);
                        setPrecioMinBD(Math.min(...precios));
                        setPrecioMaxBD(Math.max(...precios));
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los productos. Intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar productos cuando cambien los filtros
    useEffect(() => {
        let resultados = [...productos];

        // Filtrar por categoría
        if (categoriaSeleccionada) {
            resultados = resultados.filter(p =>
                p.id_categoria === parseInt(categoriaSeleccionada)
            );
        }

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
                getNombreCategoria(p.id_categoria).toLowerCase().includes(termino)
            );
        }

        setProductosFiltrados(resultados);
    }, [productos, categoriaSeleccionada, precioMin, precioMax, busqueda, getNombreCategoria]);

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setPrecioMin('');
        setPrecioMax('');
        setBusqueda('');
        setCategoriaSeleccionada('');
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando herramientas...</p>
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
        <Container className="herramientas-container py-4">
            <h1 className="text-center mb-5">Herramientas y Materiales</h1>

            {/* Filtros */}
            <Card className="p-3 mb-4">
                <Row>
                    {/* Búsqueda por texto */}
                    <Col md={4}>
                        <label className="form-label">Buscar:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre, marca o categoría..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </Col>

                    {/* Filtro por categoría */}
                    <Col md={3}>
                        <label className="form-label">Categoría:</label>
                        <select
                            className="form-select"
                            value={categoriaSeleccionada}
                            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nom_cat}
                                </option>
                            ))}
                        </select>
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

                    <Col md={1} className="d-flex align-items-end">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={limpiarFiltros}
                        >
                            Limpiar
                        </button>
                    </Col>
                </Row>
            </Card>

            {/* Resultados */}
            <Row>
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map(producto => (
                        <Col key={producto.id_producto} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={renderProductImage(producto)}
                                    alt={producto.nom_prod}
                                    style={{ height: '200px', objectFit: 'contain' }}
                                />
                                <Card.Body>
                                    <Card.Title>{producto.nom_prod}</Card.Title>
                                    <Card.Text>
                                        <small className="text-muted">
                                            {producto.descr_prod}
                                        </small>
                                    </Card.Text>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-primary">
                                            ${producto.precio.toLocaleString('es-CL')}
                                        </span>
                                        <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'
                                            }`}>
                                            {producto.stock} en stock
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            <strong>Categoría:</strong> {getNombreCategoria(producto.id_categoria)}
                                        </small>
                                    </div>
                                    <div className="button-wrapper mt-auto">
                                        <BtnAddCard
                                            producto={producto}
                                            handleAddToCart={handleAddToCart}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center py-5">
                        <div className="alert alert-info">
                            No se encontraron herramientas con los filtros aplicados
                        </div>
                        <button className="btn btn-primary" onClick={limpiarFiltros}>
                            Limpiar filtros
                        </button>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default HerramientasPage;