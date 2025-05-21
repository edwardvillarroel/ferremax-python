import React, { useState } from 'react';
import axios from 'axios';

const WebpayCheckout = () => {
  const [monto, setMonto] = useState(1000);
  const [ordenCompra, setOrdenCompra] = useState(`OC-${Math.floor(Math.random() * 10000)}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const iniciarPago = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Enviando solicitud de pago con:', { monto, ordenCompra });
      
      const response = await axios.post('http://localhost:5000/api/webpay/crear', {
        monto: parseInt(monto),
        orden_compra: ordenCompra
      });

      console.log('Respuesta recibida:', response.data);
      
      if (!response.data.url) {
        throw new Error('No se recibió la URL de redirección');
      }

      console.log('Redirigiendo a:', response.data.url);
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error en la solicitud:', err);
      setError('Error al iniciar el pago: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="webpay-checkout">
      <h2>Pago con WebPay Plus</h2>
      <form onSubmit={iniciarPago}>
        <div className="form-group">
          <label>Monto:</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Orden de Compra:</label>
          <input
            type="text"
            value={ordenCompra}
            onChange={(e) => setOrdenCompra(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Pagar con WebPay'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default WebpayCheckout;