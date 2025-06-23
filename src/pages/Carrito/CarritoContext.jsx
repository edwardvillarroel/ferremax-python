import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto para el carrito
export const CarritoContext = createContext();

// Crear el proveedor para el carrito
export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

    // Cargar el carrito desde localStorage al montar el componente
    useEffect(() => {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(carritoGuardado);
    }, []);

    // Guardar el carrito en localStorage cuando cambie
    useEffect(() => {
        if (carrito.length > 0) {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }
    }, [carrito]);

    // Función para agregar productos al carrito
    const agregarAlCarrito = (producto) => {
        setCarrito((prevCarrito) => {
            const carritoNuevo = [...prevCarrito];
            const productoExistente = carritoNuevo.find(item => item.id_producto === producto.id_producto);

            if (productoExistente) {
                // Si el producto ya existe, se actualiza la cantidad
                productoExistente.cantidad += 1;
            } else {
                // Si el producto no existe, se agrega al carrito
                carritoNuevo.push({ ...producto, cantidad: 1 });
            }

            return carritoNuevo;
        });
    };

    // Función para eliminar productos del carrito
    const eliminarDelCarrito = (idProducto) => {
        setCarrito((prevCarrito) => {
            const carritoNuevo = prevCarrito.filter(item => item.id_producto !== idProducto);
            return carritoNuevo;
        });
    };

    // Función para obtener el total de productos en el carrito
    const obtenerTotal = () => {
        return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    };

    // Nueva función para obtener la cantidad total de productos en el carrito
    const obtenerCantidadTotal = () => {
        return carrito.reduce((total, producto) => total + producto.cantidad, 0);
    };

    return (
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, obtenerTotal, obtenerCantidadTotal }}>
            {children}
        </CarritoContext.Provider>
    );
};

// Hook para acceder al contexto
export const useCarrito = () => {
    return useContext(CarritoContext);
};
