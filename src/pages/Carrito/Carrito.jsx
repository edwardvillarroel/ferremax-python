import './Carrito.css';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../Carrito/CarritoContext';

function CarritoPage() {
    const navigate = useNavigate();
    const { carrito, eliminarDelCarrito, obtenerTotal, actualizarCantidad } = useCarrito();
    const [loading, setLoading] = useState(true);
    const [error] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);


    const eliminarProducto = async (idProducto) => {
        try {
            eliminarDelCarrito(idProducto);
            Swal.fire('Producto eliminado', '', 'success');
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
        }
    };


    const handleCantidadChange = (idProducto, nuevaCantidad) => {
        if (nuevaCantidad > 0) {
            actualizarCantidad(idProducto, nuevaCantidad);
        }
    };

    const toggleSeleccionProducto = (idProducto) => {
        setProductosSeleccionados((prevSeleccionados) => {
            return prevSeleccionados.includes(idProducto)
                ? prevSeleccionados.filter((id) => id !== idProducto)
                : [...prevSeleccionados, idProducto];
        });
    };


    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="container text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Cargando carrito...</p>
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
        <div>
            <h1>Carrito de Compras</h1>

            {carrito.length === 0 ? (
                <div className="cart-empty">Tu carrito está vacío</div>
            ) : (
                <>
                    <div className="cart-list">
                        {carrito.map((item) => (
                            <div className="cart-item-card" key={item.id_producto}>
                                <input
                                    type="checkbox"
                                    checked={productosSeleccionados.includes(item.id_producto)}
                                    onChange={() => toggleSeleccionProducto(item.id_producto)}
                                    style={{ marginRight: '10px' }}
                                />
                                <img
                                    src={item.img_prod}
                                    alt={item.nom_prod}
                                    className="cart-item-img"
                                />
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.nom_prod}</div>
                                    <div className="cart-item-price">
                                        Precio: ${item.precio.toLocaleString()}
                                    </div>
                                    <div className="cart-item-quantity">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className='btn-cantidad'
                                            onClick={() =>
                                                handleCantidadChange(item.id_producto, item.cantidad - 1)
                                            }
                                        >
                                            -
                                        </Button>
                                        {item.cantidad}
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className='btn-cantidad'
                                            onClick={() =>
                                                handleCantidadChange(item.id_producto, item.cantidad + 1)
                                            }
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="cart-item-controls">
                                    <div className="cart-item-subtotal">
                                        Subtotal: ${item.precio * item.cantidad}
                                    </div>
                                </div>

                                <button
                                    className="basurero"
                                    onClick={() => eliminarProducto(item.id_producto)}
                                >X</button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-total-section">
                        Total: ${obtenerTotal().toLocaleString()}
                    </div>

                    <div className="cart-actions">
                        <Button
                            variant="success"
                            onClick={() => {
                                if (productosSeleccionados.length === 0) {
                                    Swal.fire('Selecciona al menos un producto a pagar', '', 'warning');
                                } else {
                                    const totalSeleccionados = carrito
                                        .filter(item => productosSeleccionados.includes(item.id_producto))
                                        .reduce((acc, item) => acc + item.precio * item.cantidad, 0);

                                    navigate('/webpay', { state: { total: totalSeleccionados } });
                                }
                            }}
                            className="mt-3"
                        >
                            Pagar
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CarritoPage;
