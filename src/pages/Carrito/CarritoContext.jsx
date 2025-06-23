import React, { createContext, useState, useContext, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

    useEffect(() => {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(carritoGuardado);
    }, []);

    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = (producto) => {
        setCarrito((prevCarrito) => {
            const carritoNuevo = [...prevCarrito];
            const productoExistente = carritoNuevo.find(item => item.id_producto === producto.id_producto);

            if (productoExistente) {
                productoExistente.cantidad += 1;
            } else {
                carritoNuevo.push({ ...producto, cantidad: 1 });
            }
            return carritoNuevo;
        });
    };

    const eliminarDelCarrito = (idProducto) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => item.id_producto !== idProducto));
    };

    const actualizarCantidad = (idProducto, nuevaCantidad) => {
        setCarrito(prevCarrito =>
            prevCarrito.map(item =>
                item.id_producto === idProducto
                    ? { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 }
                    : item
            )
        );
    };

    const obtenerTotal = () => {
        return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    };

    const obtenerCantidadTotal = () => {
        return carrito.reduce((total, producto) => total + producto.cantidad, 0);
    };

    return (
        <CarritoContext.Provider value={{
            carrito,
            agregarAlCarrito,
            eliminarDelCarrito,
            actualizarCantidad,
            obtenerTotal,
            obtenerCantidadTotal
        }}>
            {children}
        </CarritoContext.Provider>
    );
};

// Hook para acceder al contexto
export const useCarrito = () => {
    return useContext(CarritoContext);
};
