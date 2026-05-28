import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeriesDetail from './pages/SeriesDetail';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import AnimePage from './pages/AnimePage';
import SearchPage from './pages/SearchPage';
import AbonePage from './pages/AbonePage';
import PanelLogin from './pages/PanelLogin';
import PanelDashboard from './pages/PanelDashboard';
import NotFound from './pages/NotFound';

// Panel sayfalarında Navbar ve Footer gösterilmez
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Panel sayfaları - kendi layout'u var */}
        <Route path="/panel" element={<PanelLogin />} />
        <Route path="/panel/dashboard" element={<PanelDashboard />} />

        {/* Ana site */}
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/film/:id" element={<MovieDetail />} />
              <Route path="/dizi/:id" element={<SeriesDetail />} />
              <Route path="/filmler" element={<MoviesPage />} />
              <Route path="/diziler" element={<SeriesPage />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/ara" element={<SearchPage />} />
              <Route path="/abone" element={<AbonePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
