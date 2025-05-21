import './Carrito.css'
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function CarritoPage() {
    const navigate = useNavigate();
    const [showPopover, setShowPopover] = useState(false);
    // Carrito de prueba con datos fijos
    const [carrito,setCarrito] = useState({
        items: [
            {
                id: 1,
                nombre: "Producto de Prueba",
                precio: 1000,
                cantidad: 2,
                subtotal: 2000
            }
        ],
        total: 2000
    });

    useEffect(() => {
        const obtenerCarrito = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/carrito');
                if (!response.ok) {
                    throw new Error('Error al obtener el carrito');
                }
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_producto: idProducto,
                cantidad: nuevaCantidad
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar cantidad');
        }

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
const iniciarPago = async () => {
    navigate('/webpay');
    setShowPopover(false);
}
const eliminarProducto = async (idProducto) => {
    try {
        const response = await fetch(`http://localhost:5000/api/carrito/${idProducto}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }

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

    return (
        <div className="div-carrito">
            <h1>Carrito de Prueba WebPay</h1>

            <div className="cart-header">
                <div>Artículo</div>
                <div>Precio</div>
                <div>Cantidad</div>
                <div>Subtotal</div>
            </div>

            <div className="cart-items">
                {carrito.items.map((item) => (
                    <div key={item.id} className="cart-item">
                        <div>{item.nombre}</div>
                        <div>${item.precio.toLocaleString()}</div>
                        <div>{item.cantidad}</div>
                        <div>${item.subtotal.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    Total: ${carrito.total.toLocaleString()}
                </div>
                <Button 
                    variant="success" 
                    onClick={iniciarPago}
                    className="mt-3"
                >
                    Probar WebPay
                </Button>
            </div>
        </div>
    );
}

export default CarritoPage;