// ...importaciones...
import { Button, Card, Col, Row } from 'react-bootstrap';
import './desarrollo.css';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

// Función auxiliar para renderizar la imagen
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
    return '/imagenes/unaviable.jpg';
  }
  if (producto.img_prod.startsWith('data:image/')) {
    return producto.img_prod;
  }
  const realImageData = extractRealBase64(producto.img_prod.trim());
  if (!realImageData) {
    return '/imagenes/unaviable.jpg';
  }
  return `data:image/${realImageData.type};base64,${realImageData.base64}`;
};

// Renderizado de tarjeta reutilizable
function ProductCards({ productos }) {
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito'
      });
    }
  };

  return (
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
          </Col>
        ))
      ) : (
        <p>No hay productos disponibles</p>
      )}
    </Row>
  );
}

// Lanzamientos nuevos (máximo 3)
export function MediaCardLanzamientos() {
  const [productos, setProductos] = useState([]); 

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        const lanzamientos = productosData
          .filter(prod => prod.lanzamiento === 1)
          .slice(0, 4);
        setProductos(lanzamientos);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los lanzamientos'
        });
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  return <ProductCards productos={productos} />;
}

// En promoción (máximo 3)
export function MediaCardPromocion() {
  const [productos, setProductos] = useState([]); 

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos');
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        const promociones = productosData
          .filter(prod => prod.promocion === 1)
          .slice(0, 4);
        setProductos(promociones);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las promociones'
        });
        setProductos([]);
      }
    };
    fetchProductos();
  }, []);

  return <ProductCards productos={productos} />;
}