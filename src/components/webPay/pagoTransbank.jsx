import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';
import './pagowebpay.css'

const TransbankPayment = ({
apiBaseUrl = process.env.REACT_APP_API_URL || '/api',
  onPaymentSuccess,
  onPaymentError,
  returnUrl = `${window.location.origin}/payment-result`,
  className = ''
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/webpay/crear_transaccion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          return_url: returnUrl,
          description: description || 'Pago online'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Guardar información en localStorage para el retorno
        localStorage.setItem('transbank_payment_data', JSON.stringify({
          buy_order: data.buy_order,
          amount: data.amount,
          timestamp: new Date().toISOString()
        }));

        // Redirigir a Transbank
        window.location.href = `${data.url}?token_ws=${data.token}`;
      } else {
        if (onPaymentError) {
          onPaymentError(data.error);
        } else {
          alert(`Error: ${data.error}`);
        }
      }
    } catch (error) {
      const errorMsg = `Error de conexión: ${error.message}`;
      if (onPaymentError) {
        onPaymentError(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`webpay-container ${className}`}>
      <div className="webpay-header">
        <CreditCard className="webpay-icon" />
        <h2>Pagar con Transbank</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="webpay-label">Descripción (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del pago"
            className="webpay-input"
          />
        </div>

        <div>
          <label className="webpay-label">Monto a Pagar *</label>
          <div className="webpay-amount-container">
            <DollarSign className="webpay-amount-icon" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingresa el monto"
              className="webpay-input-amount"
              min="1"
              step="1"
              required
            />
          </div>
          {amount && (
            <p className="webpay-total-text">
              Total: {formatCurrency(parseFloat(amount) || 0)}
            </p>
          )}
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !amount}
          className="webpay-button"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Procesando...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Pagar {amount && `${formatCurrency(parseFloat(amount))}`}
            </div>
          )}
        </button>
      </div>

      <div className="webpay-footer">
        🔒 Ambiente de pruebas - No se realizarán cargos reales
      </div>
    </div>

  );
};

export default TransbankPayment;