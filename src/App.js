import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
const HerramientasPage = lazy(() => import('./pages/Productos/HerramientasPage.jsx'));
const GestionEmpleados = lazy(() => import('./pages/Admin/AdminPages/GestionEmpleados.jsx'));
const GestionInventario = lazy(() => import('./pages/Admin/AdminPages/GestionInventario.jsx'));
const TornillosPage = lazy(() => import('./pages/Productos/Tornillos/TornillosPage.jsx'));
const FijacionesPage = lazy(() => import('./pages/Productos/Fijaciones/FijacionesPage.jsx'));
const MedicionPage = lazy(() => import('./pages/Productos/EquiposDeMedicion/MedicionPage.jsx'));

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
    <Router>
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
              <Route path="/Herramientas" element={<HerramientasPage />} />
              <Route path="/webPay" element={<TransbankPayment />} />
              <Route path="/resultado" element={<PaymentResult />} />
              <Route path="/admin/empleados" element={<GestionEmpleados />} />
              <Route path="/admin/inventario" element={<GestionInventario />} />
              <Route path="/Tornillos" element={<TornillosPage />} />
              <Route path="/Fijaciones" element={<FijacionesPage />} />
              <Route path="/equipos-de-medicion" element={<MedicionPage />} />
            </Routes>
          </Suspense>
        </main>
        <FooterFerremax />
      </div>
    </Router>
  );
}

export default App;