import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const ResultadoPago = () => {
  const location = useLocation();
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const token = queryParams.get('token');
    
    if (status === 'error') {
      setError(queryParams.get('message') || 'Error en el procesamiento del pago');
      setLoading(false);
      return;
    }
    
    if (token) {
      // Consultar el estado de la transacción
      consultarEstado(token);
    } else {
      setError('No se recibió información de la transacción');
      setLoading(false);
    }
  }, [location]);

  const consultarEstado = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/estado-transaccion?token=${token}`);
      setResultado(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al consultar el estado del pago: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando resultado del pago...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error en la transacción</h2>
        <p>{error}</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="resultado-pago">
      <h2>Resultado de la Transacción</h2>
      {resultado && (
        <div className="transaction-details">
          <p><strong>Estado:</strong> {resultado.estado}</p>
          <p><strong>Orden de Compra:</strong> {resultado.orden_compra}</p>
          <p><strong>Monto:</strong> ${resultado.monto}</p>
          {resultado.tarjeta && <p><strong>Tarjeta:</strong> {resultado.tarjeta}</p>}
          <p><strong>Fecha:</strong> {resultado.fecha_transaccion}</p>
        </div>
      )}
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default ResultadoPago;