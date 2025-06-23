import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';

function BtnAddCard({ producto, handleAddToCart }) {
    const [buttonText, setButtonText] = useState('Añadir al carrito');
    const [isDisabled, setIsDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const agregarAlCarrito = () => {
        setButtonText('Añadiendo...');
        setLoading(true);  // Activa el spinner
        setIsDisabled(true);

        // Simula el tiempo de retraso con un setTimeout
        setTimeout(() => {
            handleAddToCart(producto);
            setButtonText('Añadido');
            setLoading(false);  // Detiene el spinner
        }, 1000); // Simula un retraso de 1 segundo
    };

    return (
        <Button
            className="button-card w-100"
            onClick={agregarAlCarrito}
            disabled={isDisabled || producto.stock === 0}
        >
            {loading ? (
                // Solo mostrar spinner si está cargando
                <Spinner animation="border" size="sm" />
            ) : producto.stock > 0 ? (
                buttonText
            ) : (
                // Muestra 'Sin stock' si no hay stock
                'Sin stock'
            )}
        </Button>
    );
}

export default BtnAddCard;
