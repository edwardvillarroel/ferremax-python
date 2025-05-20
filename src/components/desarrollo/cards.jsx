import { Button, Card } from 'react-bootstrap';
import './desarrollo.css';
import { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';


export function MediaCard({ producto= {
  nombreProducto: 'Producto',
  marca: 'Marca',
  precio: '0',
  imagen: '/imagenes/ejemplo.png'
} }) {
  const handleAddToCart = async () => {

  
  };

  return (
    <div className="media-card-wrapper">
      <Card className="cardPromocion">
        <Card.Img variant="top" src="/imagenes/ejemplo.png" />
        <div className="card-divider"/>
        <Card.Body className="card-body-custom">
          <Card.Title className="card-title">{producto.nombreProducto}</Card.Title>
          <Card.Subtitle>{producto.marca}</Card.Subtitle>
          <Card.Text>
            <span className="current-price">${producto.precio}</span>
            {producto.precioAnterior && (
              <span className="old-price">${producto.precioAnterior}</span>
            )}
          </Card.Text>

          <div className="button-wrapper">
            <Button className="button-card" onClick={handleAddToCart}>
              Añadir al carrito
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export function MediaCardLanzamientos({ producto = {
  nombreProducto: 'Producto',
  marca: 'Marca',
  precio: '0',
  imagen: '/imagenes/ejemplo.png'
} }) {
  const handleAddToCart = async () => {
    try {
      const clienteId = localStorage.getItem('clienteId');
      if (!clienteId) {
        Swal.fire({
          icon: 'warning',
          title: 'Inicia sesión',
          text: 'Debes iniciar sesión para agregar productos al carrito'
        });
        return;
      }



     
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito'
      });
    }
  };

  return (
    <div className="media-card-wrapper">
      <Card className="cardPromocion">
      <Card.Img variant="top" src="/imagenes/ejemplo.png" />
        <div className="card-divider"/>
        <Card.Body className="card-body-custom">
          <Card.Title className="card-title">{producto.nombreProducto}</Card.Title>
          <Card.Subtitle>{producto.marca}</Card.Subtitle>
          <Card.Text>
            <span className="current-price">${producto.precio}</span>
          </Card.Text>

          <div className="button-wrapper">
            <Button className="button-card" onClick={handleAddToCart}>
              Añadir al carrito
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

