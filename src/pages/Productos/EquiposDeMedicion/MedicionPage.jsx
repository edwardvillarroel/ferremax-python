import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './MedicionPage.css';
import { useCarrito } from '../../Carrito/CarritoContext';
import BtnAddCard from '../../../btnAddCard';
import API_BASE_URL from '../../../config/apiConfig';

// Función para extraer base64 real si viene codificada
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

// Función para formatear la imagen correctamente
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

const MedicionPage = () => {
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
                    const equiposMedicion = data.data.filter(p => p.id_categoria === 7);
                    setProductos(equiposMedicion);
                    setProductosFiltrados(equiposMedicion);

                    if (equiposMedicion.length > 0) {
                        const precios = equiposMedicion.map(p => p.precio);
                        setPrecioMinBD(Math.min(...precios));
                        setPrecioMaxBD(Math.max(...precios));
                    }
                }
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los equipos de medición. Intente nuevamente.');
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
            img_prod: renderProductImage(producto) // Sobrescribe img_prod con la versión formateada
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
        <div className="container medicion-container py-4">
            <h1 className="text-center mb-5">Equipos de Medición</h1>

            {/* Filtros */}
            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar productos"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="d-flex mt-3">
                    <input
                        type="number"
                        className="form-control me-2"
                        placeholder={`$${precioMinBD}`}
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                    />
                    <input
                        type="number"
                        className="form-control"
                        placeholder={`$${precioMaxBD}`}
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                    />
                    <button className="btn btn-secondary ms-2" onClick={limpiarFiltros}>Limpiar</button>
                </div>
            </div>

            <div className="row">
                {productosFiltrados.map((producto) => (
                    <div key={producto.id_producto} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div className="card h-100 shadow-sm equipo-card">
                            <img
                                className="card-img-top"
                                src={renderProductImage(producto)}
                                alt={producto.nom_prod}
                                style={{ height: '200px', objectFit: 'contain' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-truncate">{producto.nom_prod}</h5>
                                <div className="mb-2">
                                    <small className="text-muted"><strong>Marca:</strong> {producto.marca}</small>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
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
                ))}
            </div>
        </div>
    );
};

export default MedicionPage;
