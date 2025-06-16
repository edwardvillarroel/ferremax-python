import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CurrencyProvider } from './contexts/MonedaContext';
import HeaderFerremax from './components/header/header';
import ImgBanner from './components/carousel/imagenesCarousel';
import FooterFerremax from './components/footer/footer';
import NavbarF from './components/navbar/NavbarF';
import { MediaCardPromocion, MediaCardLanzamientos } from './components/desarrollo/cards';

const InicioPage = lazy(() => import('./pages/InicioSesion/InicioPage'));
const RegistroUser = lazy(() => import('./pages/Registro/Registro'));
const CarritoPage = lazy(() => import('./pages/Carrito/Carrito'));
const AdminPage = lazy(() => import('./pages/Admin/Admin'));
const TransbankPayment = lazy(() => import('./components/webPay/pagoTransbank'));
const PaymentResult = lazy(() => import('./components/webPay/resultadoPago'));
const ProductoPage = lazy(() => import('./pages/Productos/ProductoPage'));
const GestionEmpleados = lazy(() => import('./pages/Admin/AdminPages/GestionEmpleados.jsx'));
const GestionInventario = lazy(() => import('./pages/Admin/AdminPages/GestionInventario.jsx'));

function Inicio() {
  return (
    <>
      <ImgBanner />
      <h1 style={{ textAlign: 'center', margin: '2rem 0', color: 'black' }}>
        Productos en Promoción
      </h1>
      <div className="cards-wrapper">
        <MediaCardPromocion />
      </div>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', color: 'black' }}>
        Lanzamientos Recientes
      </h1>
      <div className="cards-wrapper">
        <MediaCardLanzamientos />
      </div>
    </>
  );
}

function App() {
  return (
    <CurrencyProvider>
      <div className="page-container">
        <header>
          <HeaderFerremax />
          <NavbarF />
        </header>
        <main className="content-wrap">
          <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/Home" />} />
              <Route path="/Home" element={<Inicio />} />
              <Route path="/inicio" element={<InicioPage />} />
              <Route path="/registro" element={<RegistroUser />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/TuCarrito" element={<CarritoPage />} />
              <Route path="/Producto" element={<ProductoPage />} />
              <Route path="/webPay" element={<TransbankPayment />} />
              <Route path="/resultado" element={<PaymentResult />} />
              <Route path="/admin/empleados" element={<GestionEmpleados />} />
              <Route path="/admin/inventario" element={<GestionInventario />} />
            </Routes>
          </Suspense>
        </main>
        <FooterFerremax />
      </div>
    </CurrencyProvider>
  );
}

export default App;
