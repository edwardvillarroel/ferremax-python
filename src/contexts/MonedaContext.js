import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config/apiConfig';

const MonedaContext = createContext();

export const useCurrency = () => {
  const context = useContext(MonedaContext);
  if (!context) {
    throw new Error('useCurrency debe ser usado dentro de CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('CLP');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(false);

  const currencySymbols = {
    'CLP': '$',
    'ARS': 'AR$',
    'BOL': 'Bs',
    'BRL': 'R$',
    'EUR': '€',
    'USD': 'US$',
    'PEN': 'S/'
  };

  const changeCurrency = async (newCurrency) => {
    if (newCurrency === currentCurrency) return;
    
    setLoading(true);
    let requestUrl = ''; 

    try {
      if (newCurrency === 'CLP') {
        setCurrentCurrency('CLP');
        setExchangeRate(1);
        Swal.fire({
            icon: 'success',
            title: 'Moneda cambiada con éxito',
            showConfirmButton: false,
            timer: 500 
        });
      } else {
        requestUrl = `${API_BASE_URL}/exchange-rate/${newCurrency}`;
        const response = await axios.get(requestUrl);
        
        let actualData = response.data; 

        if (actualData && actualData.success === true) { 
            let receivedRate = actualData.rate;
            
            if (typeof receivedRate === 'string') {
                receivedRate = parseFloat(receivedRate);
            }
            
            if (typeof receivedRate === 'number' && !isNaN(receivedRate) && receivedRate > 0) {
                setExchangeRate(receivedRate);
                setCurrentCurrency(newCurrency);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Moneda cambiada con éxito',
                    showConfirmButton: false,
                    timer: 500 
                });
            } else {
                throw new Error(`Tasa de cambio inválida: ${receivedRate}`);
            }
        } else {
          const errorMessage = actualData?.message || 'No se pudo obtener la tasa de cambio';
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error al cambiar moneda:', error);
      
      let errorMessage = 'Error desconocido';      
      
      if (error.response) {
        errorMessage = `Error del servidor (${error.response.status})`;
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al cambiar moneda',
        text: errorMessage,
        showConfirmButton: false, 
        timer: 500 
      });
      
      setExchangeRate(1); 
      setCurrentCurrency('CLP'); 
    } finally {
      setLoading(false);
    }
  };

  const convertPrice = (clpPrice) => {
    let convertedPrice;
    
    if (currentCurrency === 'CLP') {
        convertedPrice = clpPrice;
    } else {
        convertedPrice = clpPrice / exchangeRate;
    }

    if (isNaN(convertedPrice)) {
      console.error('Error de conversión:', {
        clpPrice,
        exchangeRate,
        currentCurrency
      });
      return 0; 
    }

    return Math.round(convertedPrice * 100) / 100; 
  };

  const formatPrice = (clpPrice) => {
    const convertedPrice = convertPrice(clpPrice);
    const symbol = currencySymbols[currentCurrency] || currentCurrency;
    
    let formattedNumber;
    if (currentCurrency === 'CLP') {
      formattedNumber = parseInt(convertedPrice).toLocaleString('es-CL');
    } else {
      if (convertedPrice % 1 === 0) {
        formattedNumber = parseInt(convertedPrice).toLocaleString('es-CL');
      } else {
        formattedNumber = convertedPrice.toLocaleString('es-CL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
    
    return `${symbol} ${formattedNumber}`;
  };

  return (
    <MonedaContext.Provider value={{
      currentCurrency,
      exchangeRate,
      loading,
      changeCurrency,
      convertPrice,
      formatPrice
    }}>
      {children}
    </MonedaContext.Provider>
  );
};