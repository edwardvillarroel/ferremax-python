import './Carrito.css'
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from 'axios';
import Swal from 'sweetalert2';

function CarritoPage() {
    const [carrito, setCarrito] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clienteId, setClienteId] = useState(null);

    const obtenerClienteId = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://bd-ferremas-clientes.crwi4crvnqsy.us-east-1.rds.amazonaws.com:8081/api/clientes/perfil', {
              headers: { Authorization: `Bearer ${token}` }
          });
         
      } catch (error) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo obtener la información del cliente'
          });
      }
  };

    if (loading) {
      return <div className="loading">Cargando...</div>;
  }

    return (
        <div className="div-carrito">
            <h1>Carro de compra</h1>

            <div className="cart-header">
                <div>Artículo</div>
                <div>Precio</div>
                <div>Cantidad</div>
                <div>Subtotal</div>
                <div></div>
            </div>

            

                   

              
            )

            {carrito && carrito.items.length > 0 && (
                <div className="cart-footer">
                    <div className="cart-total">
                        Total: ${carrito.total.toLocaleString()}
                    </div>
                </div>
            )}

            {(!carrito || carrito.items.length === 0) && (
                <div className="cart-empty">
                    <p>Tu carrito está vacío</p>
                </div>
            )}
        </div>
    );
}

export default CarritoPage;