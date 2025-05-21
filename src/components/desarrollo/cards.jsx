import { Button, Card } from 'react-bootstrap';
import './desarrollo.css';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

export function MediaCard() {
  const [productos, setProductos] = useState([]); 

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        
        // Eliminar duplicados usando Map para mantener solo una instancia por ID
        const productosMap = new Map();
        productosData.forEach(producto => {
          if (!productosMap.has(producto.id_producto)) {
            productosMap.set(producto.id_producto, producto);
          }
        });
        
        const productosUnicos = Array.from(productosMap.values());
        setProductos(productosUnicos);
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos'
        });
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);

  const handleAddToCart = async (producto) => {
    try {
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: 'El producto se agregó al carrito correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito'
      });
    }
  };

  return (
    <div className="products-container">
      {Array.isArray(productos) && productos.length > 0 ? (
        productos.map((producto) => (
          <div key={producto.id_producto} className="media-card-wrapper">
            <Card className="cardPromocion">
              <Card.Img variant="top" src={producto.img_prod} onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagenes/unaviable.jpg';
                  }}/>
              <div className="card-divider"/>
              <Card.Body className="card-body-custom">
                <Card.Title className="card-title">{producto.nom_prod}</Card.Title>
                <Card.Subtitle>{producto.marca}</Card.Subtitle>
                <Card.Text>
                  <span className="current-price">${producto.precio}</span>
                  <p className="description">{producto.descr_prod}</p>
                  <span className="stock">Stock: {producto.stock} unidades</span>
                </Card.Text>
                <div className="button-wrapper">
                  <Button className="button-card" onClick={() => handleAddToCart(producto)}>
                    Añadir al carrito
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))
      ) : (
        <p>No hay productos disponibles</p>
      )}
    </div>
  );
}

export function MediaCardLanzamientos() {
  const [productos, setProductos] = useState([]); 

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        
        // Eliminar duplicados usando Map para mantener solo una instancia por ID
        const productosMap = new Map();
        productosData.forEach(producto => {
          if (!productosMap.has(producto.id_producto)) {
            productosMap.set(producto.id_producto, producto);
          }
        });
        
        const productosUnicos = Array.from(productosMap.values());
        setProductos(productosUnicos);
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos'
        });
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);
}