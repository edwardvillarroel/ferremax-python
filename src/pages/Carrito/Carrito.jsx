import './Carrito.css';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function CarritoPage() {
    const navigate = useNavigate();
    const [carrito, setCarrito] = useState({
        items: [{
            id: 1,
            nombre: "Producto de Prueba",
            precio: 1000,
            cantidad: 2,
            subtotal: 2000
        }],
        total: 0
    });

    useEffect(() => {
        const obtenerCarrito = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/carrito');
                if (!response.ok) throw new Error('Error al obtener el carrito');
                const data = await response.json();
                setCarrito(data);
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el carrito'
                });
            }
        };

        obtenerCarrito();
    }, []);

    const actualizarCantidad = async (idProducto, nuevaCantidad) => {
        try {
            const response = await fetch('http://localhost:5000/api/carrito', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_producto: idProducto,
                    cantidad: nuevaCantidad
                })
            });

            if (!response.ok) throw new Error('Error al actualizar cantidad');
            const data = await response.json();
            setCarrito(data);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la cantidad'
            });
        }
    };

    const eliminarProducto = async (idProducto) => {
        try {
            const response = await fetch(`http://localhost:5000/api/carrito/${idProducto}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar producto');
            const data = await response.json();
            setCarrito(data);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el producto'
            });
        }
    };

    const iniciarPago = () => {
        navigate('/webpay');
    };

    return (
        <div className="div-carrito">
            <h1>Carrito de Compras</h1>

            {carrito.items.length === 0 ? (
                <div className="cart-empty">Tu carrito está vacío</div>
            ) : (
                <>
                    <div className="cart-list">
                        {carrito.items.map((item) => (
                            <div className="cart-item-card" key={item.id}>
                                <img src="/ruta-imagen.jpg" alt={item.nombre} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.nombre}</div>
                                    <div className="cart-item-price">Precio: ${item.precio.toLocaleString()}</div>
                                </div>

                                <div className="cart-item-controls">
                                    <div className="qty-control">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() =>
                                                actualizarCantidad(item.id, item.cantidad > 1 ? item.cantidad - 1 : 1)
                                            }
                                        >
                                            -
                                        </Button>
                                        <span>{item.cantidad}</span>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                        >
                                            +
                                        </Button>
                                    </div>

                                    <div className="cart-item-subtotal">
                                        Subtotal: ${item.subtotal.toLocaleString()}
                                    </div>



                                </div>
                                <button className="basurero" onClick={() => eliminarProducto(item.id)}>
                                    X
                                </button>

                            </div>
                        ))}
                    </div>

                    <div className="cart-total-section">
                        Total: ${carrito.total.toLocaleString()}
                    </div>

                    <div className="cart-actions">
                        <Button variant="success" onClick={iniciarPago} className="mt-3">
                            Pagar
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CarritoPage;
