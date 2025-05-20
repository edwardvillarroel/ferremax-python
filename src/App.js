import { Routes, Route, Navigate } from 'react-router-dom';
import HeaderFerremax from './components/header/header';
import ImgBanner from './components/carousel/imagenesCarousel';
import FooterFerremax from './components/footer/footer';
import NavbarF from './components/navbar/NavbarF';
import { MediaCard, MediaCardLanzamientos } from './components/desarrollo/cards';
import InicioPage from './pages/InicioSesion/InicioPage';
import RegistroUser from './pages/Registro/Registro';
import CarritoPage from './pages/Carrito/Carrito';
import AdminPage from './pages/Admin/Admin';
import ProductoPage from './pages/Productos/ProductoPage';


function Inicio() {
  return (
    <>
      <ImgBanner />
      <h1 style={{ textAlign: 'center', margin: '2rem 0', color: 'black' }}>
        Productos en Promoción
      </h1>
      <div className="cards-wrapper">
        <MediaCard />
        <MediaCard />
        <MediaCard />
      </div>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', color: 'black' }}>
        Lanzamientos Recientes
      </h1>
      <div className="cards-wrapper">
        <MediaCardLanzamientos />
        <MediaCardLanzamientos />
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
          <Route path="/Producto" element={<ProductoPage />} />
        </Routes>
      </main>
      <FooterFerremax />
    </div>
  );
}

export default App;
