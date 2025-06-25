import { Card, Col, Row } from 'react-bootstrap';
import './desarrollo.css';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import BtnAddCard from '../../btnAddCard';
import { useCarrito } from '../../pages/Carrito/CarritoContext';
import { useCurrency } from '../../contexts/MonedaContext';
import API_BASE_URL from '../../config/apiConfig';

// Función para extraer base64 de la imagen
const extractRealBase64 = (encodedString) => {
  try {
    const decoded = atob(encodedString);
    const match = decoded.match(/data:image\/([^;]+);base64,([^)]+)/);
    if (match) {
      return {
        type: match[1],
        base64: match[2],
      };
    }
  } catch (error) {
    return null;
  }
  return null;
};

// Función para renderizar la imagen del producto
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

function MediaCardLanzamientos() {
  const [productos, setProductos] = useState([]);
  const { agregarAlCarrito } = useCarrito();
  const { formatPrice } = useCurrency(); // Usamos el hook para formatear precios

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/productos`);
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        const lanzamientos = productosData
          .filter((prod) => prod.lanzamiento === 1) // Filtrar productos de lanzamiento
          .slice(0, 4); // Limitar a los primeros 4
        setProductos(lanzamientos);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los lanzamientos',
        });
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);

  const handleAddToCart = (producto) => {
    const productoConImagen = {
      ...producto,
      img_prod: renderProductImage(producto),
    };

    agregarAlCarrito(productoConImagen);
    Swal.fire({
      title: 'Producto agregado',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
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
              <div className="card-divider" />
              <Card.Body className="card-body-custom">
                <Card.Title className="card-title">{producto.nom_prod}</Card.Title>
                <Card.Subtitle>{producto.marca}</Card.Subtitle>
                <Card.Text>
                  <span className="current-price">{formatPrice(producto.precio)}</span>
                  <p className="description">{producto.descr_prod}</p>
                  <span className="stock">Stock: {producto.stock} unidades</span>
                </Card.Text>
                <div className="button-wrapper">
                  <BtnAddCard
                    producto={producto}
                    handleAddToCart={handleAddToCart}
                    className="button-card"
                  />
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

function MediaCardPromocion() {
  const [productos, setProductos] = useState([]);
  const { agregarAlCarrito } = useCarrito();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/productos`);
        const productosData = Array.isArray(response.data.data) ? response.data.data : [];
        const promociones = productosData
          .filter((prod) => prod.promocion === 1) // Filtrar productos de promoción
          .slice(0, 4); // Limitar a los primeros 4
        setProductos(promociones);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las promociones',
        });
        setProductos([]);
      }
    };

    fetchProductos();
  }, []);

  const handleAddToCart = (producto) => {
    const productoConImagen = {
      ...producto,
      img_prod: renderProductImage(producto),
    };

    agregarAlCarrito(productoConImagen);
    Swal.fire({
      title: 'Producto agregado',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
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
              <div className="card-divider" />
              <Card.Body className="card-body-custom">
                <Card.Title className="card-title">{producto.nom_prod}</Card.Title>
                <Card.Subtitle>{producto.marca}</Card.Subtitle>
                <Card.Text>
                  <span className="current-price">{formatPrice(producto.precio)}</span>
                  <p className="description">{producto.descr_prod}</p>
                  <span className="stock">Stock: {producto.stock} unidades</span>
                </Card.Text>
                <div >
                  <BtnAddCard
                    producto={producto}
                    handleAddToCart={handleAddToCart}
                    className="button-card"
                  />
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

export { MediaCardLanzamientos, MediaCardPromocion };
