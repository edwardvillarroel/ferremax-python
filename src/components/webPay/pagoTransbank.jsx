import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';

const TransbankPayment = ({ 
  apiBaseUrl = 'http://localhost:5000/api',
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
    <div className={`bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <CreditCard className="h-8 w-8 text-indigo-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Pagar con Transbank</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del pago"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Pagar *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingresa el monto"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              min="1"
              step="1"
              required
            />
          </div>
          {amount && (
            <p className="mt-2 text-sm text-gray-600">
              Total: {formatCurrency(parseFloat(amount) || 0)}
            </p>
          )}
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !amount}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          🔒 Ambiente de pruebas - No se realizarán cargos reales
        </p>
      </div>
    </div>
  );
};

export default TransbankPayment;