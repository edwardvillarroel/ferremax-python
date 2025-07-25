import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './FijacionesPage.css';
import { useCarrito } from '../../Carrito/CarritoContext';
import BtnAddCard from '../../../btnAddCard';
import API_BASE_URL from '../../../config/apiConfig';

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

const FijacionesPage = () => {
    const { agregarAlCarrito } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const [precioMinBD, setPrecioMinBD] = useState(0);
    const [precioMaxBD, setPrecioMaxBD] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${API_BASE_URL}/productos`);
                const data = await response.json();

                if (data.success) {
                    const fijaciones = data.data.filter(p => p.id_categoria === 6);
                    setProductos(fijaciones);
                    setProductosFiltrados(fijaciones);

                    if (fijaciones.length > 0) {
                        const precios = fijaciones.map(p => p.precio);
                        setPrecioMinBD(Math.min(...precios));
                        setPrecioMaxBD(Math.max(...precios));
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar las fijaciones. Intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let resultados = [...productos];

        if (precioMin) {
            resultados = resultados.filter(p => p.precio >= parseFloat(precioMin));
        }

        if (precioMax) {
            resultados = resultados.filter(p => p.precio <= parseFloat(precioMax));
        }

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

    const limpiarFiltros = () => {
        setPrecioMin('');
        setPrecioMax('');
        setBusqueda('');
    };

    const handleAddToCart = (producto) => {
        const productoConImagen = {
            ...producto,
            img_prod: renderProductImage(producto) // Formatear imagen antes de agregar
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

    if (loading) {
        return (
            <div className="container text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container text-center my-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container fijaciones-container py-4">
            <h1 className="text-center mb-5">Fijaciones y Sujetadores</h1>

            <div className="card p-3 mb-4">
                <div className="row">
                    <div className="col-md-5">
                        <label className="form-label">Buscar fijaciones:</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre, marca o descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
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
                    </div>

                    <div className="col-md-2">
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
                    </div>

                    <div className="col-md-3 d-flex align-items-end">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={limpiarFiltros}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-muted">
                    Mostrando {productosFiltrados.length} fijación{productosFiltrados.length !== 1 ? 'es' : ''}
                    {busqueda && ` para "${busqueda}"`}
                </p>
            </div>

            <div className="row">
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map(producto => (
                        <div key={producto.id_producto} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    className="card-img-top"
                                    src={renderProductImage(producto)}
                                    alt={producto.nom_prod}
                                    style={{ height: '200px', objectFit: 'contain' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title text-truncate" title={producto.nom_prod}>
                                        {producto.nom_prod}
                                    </h5>
                                    <p className="card-text">
                                        <small className="text-muted">{producto.descr_prod}</small>
                                    </p>
                                    <div className="mb-2">
                                        <small className="text-muted"><strong>Marca:</strong> {producto.marca}</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-primary fs-5">
                                            ${producto.precio.toLocaleString('es-CL')}
                                        </span>
                                        <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
                                        </span>
                                    </div>
                                    <div className="button-wrapper mt-auto">
                                        <BtnAddCard
                                            producto={producto}
                                            handleAddToCart={handleAddToCart}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="alert alert-info">
                            <h4>No se encontraron fijaciones</h4>
                            <p>No hay fijaciones que coincidan con los filtros aplicados</p>
                        </div>
                        <button className="btn btn-primary" onClick={limpiarFiltros}>
                            Ver todas las fijaciones
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FijacionesPage;
