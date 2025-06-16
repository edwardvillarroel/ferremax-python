import { Routes, Route, Navigate } from 'react-router-dom';
import HeaderFerremax from './components/header/header';
import ImgBanner from './components/carousel/imagenesCarousel';
import FooterFerremax from './components/footer/footer';
import NavbarF from './components/navbar/NavbarF';
import { MediaCardPromocion, MediaCardLanzamientos } from './components/desarrollo/cards';
import InicioPage from './pages/InicioSesion/InicioPage';
import RegistroUser from './pages/Registro/Registro';
import CarritoPage from './pages/Carrito/Carrito';
import AdminPage from './pages/Admin/Admin';
import TransbankPayment from './components/webPay/pagoTransbank';
import PaymentResult from './components/webPay/resultadoPago';
import HerramientasPage from './pages/Productos/HerramientasPage.jsx';
import GestionEmpleados from './pages/Admin//AdminPages/GestionEmpleados.jsx';
import GestionInventario from './pages/Admin//AdminPages/GestionInventario.jsx';
import TornillosPage from './pages/Productos/Tornillos/TornillosPage.jsx';
import FijacionesPage from './pages/Productos/Fijaciones/FijacionesPage.jsx';
import MedicionPage from './pages/Productos/EquiposDeMedicion/MedicionPage.jsx';


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
    <div className="page-container">
      <header>
        <HeaderFerremax />
        <NavbarF />
      </header>

      <main className="content-wrap">
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
      </main>
      <FooterFerremax />
    </div>
  );
}

export default App;
