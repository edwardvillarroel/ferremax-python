import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

const PaymentResult = ({ 
  apiBaseUrl = 'http://localhost:5000/api',
  onBackToPayment,
  className = ''
}) => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmPayment = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/confirmar-transaccion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setPaymentResult(data);
      
      // Limpiar datos temporales
      localStorage.removeItem('transbank_payment_data');
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError('Error al procesar el resultado del pago');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token_ws');
    
    if (token) {
      confirmPayment(token);
    } else {
      setError('Token de transacción no encontrado');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center ${className}`}>
        <Loader2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Procesando Pago</h2>
        <p className="text-gray-600">Confirmando tu transacción...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center ${className}`}>
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        
        {onBackToPayment && (
          <button
            onClick={onBackToPayment}
            className="flex items-center justify-center w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Intentar
          </button>
        )}
      </div>
    );
  }

  const isSuccess = paymentResult?.success && paymentResult?.status === 'AUTHORIZED';

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center ${className}`}>
      {isSuccess ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Pago Exitoso!
          </h2>
          <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente</p>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pago Rechazado
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentResult?.error || 'No se pudo procesar el pago'}
          </p>
        </>
      )}

      {/* Detalles de la transacción */}
      {paymentResult && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">Detalles de la Transacción</h3>
          <div className="space-y-2 text-sm">
            {paymentResult.buy_order && (
              <div className="flex justify-between">
                <span className="text-gray-600">Orden de Compra:</span>
                <span className="font-medium">{paymentResult.buy_order}</span>
              </div>
            )}
            {paymentResult.amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">{formatCurrency(paymentResult.amount)}</span>
              </div>
            )}
            {paymentResult.status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentResult.status}
                </span>
              </div>
            )}
            {paymentResult.authorization_code && (
              <div className="flex justify-between">
                <span className="text-gray-600">Código de Autorización:</span>
                <span className="font-mono text-xs">{paymentResult.authorization_code}</span>
              </div>
            )}
            {paymentResult.transaction_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{formatDate(paymentResult.transaction_date)}</span>
              </div>
            )}
            {paymentResult.response_code && (
              <div className="flex justify-between">
                <span className="text-gray-600">Código de Respuesta:</span>
                <span className="font-mono text-xs">{paymentResult.response_code}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        {isSuccess ? (
          <button
            onClick={() => {
              // Limpiar URL parameters
              window.history.replaceState({}, document.title, window.location.pathname);
              if (onBackToPayment) onBackToPayment();
            }}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Realizar Otro Pago
          </button>
        ) : (
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              if (onBackToPayment) onBackToPayment();
            }}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Intentar Nuevamente
          </button>
        )}
        
        {onBackToPayment && (
          <button
            onClick={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              onBackToPayment();
            }}
            className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </button>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          {isSuccess 
            ? '✅ Transacción completada en ambiente de pruebas'
            : '❌ Transacción rechazada en ambiente de pruebas'
          }
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;