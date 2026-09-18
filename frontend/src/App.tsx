import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { RequireAuth } from './components/RequireAuth';
import { RequireGuestIntro } from './components/RequireGuestIntro';
import { AuthProvider } from './context/AuthProvider';
import { CatalogProvider } from './context/CatalogProvider';
import { ProfileProvider } from './context/ProfileProvider';
import { ServicesProvider } from './context/ServicesProvider';
import { ToastProvider } from './context/ToastProvider';
import { GateLayout } from './layouts/GateLayout';
import { PanelLayout } from './layouts/PanelLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { ResultsPage } from './pages/ResultsPage';
import { WelcomePage } from './pages/WelcomePage';
import { EditServicePage } from './pages/panel/EditServicePage';
import { MyProfilePage } from './pages/panel/MyProfilePage';
import { NewServicePage } from './pages/panel/NewServicePage';
import { OverviewPage } from './pages/panel/OverviewPage';
import { ServicesPage } from './pages/panel/ServicesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CatalogTree() {
  return (
    <CatalogProvider>
      <ProfileProvider>
        <ServicesProvider>
          <Outlet />
        </ServicesProvider>
      </ProfileProvider>
    </CatalogProvider>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<GateLayout />}>
            <Route path="/bem-vindo" element={<WelcomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          <Route element={<CatalogTree />}>
            <Route element={<PublicLayout />}>
              <Route path="/entrar" element={<LoginPage />} />
              <Route path="/cadastrar" element={<RegisterPage />} />
            </Route>

            <Route
              path="/painel"
              element={
                <RequireAuth>
                  <PanelLayout />
                </RequireAuth>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="perfil" element={<MyProfilePage />} />
              <Route path="servicos" element={<ServicesPage />} />
              <Route path="servicos/novo" element={<NewServicePage />} />
              <Route
                path="servicos/:id/editar"
                element={<EditServicePage />}
              />
            </Route>

            <Route element={<RequireGuestIntro />}>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/buscar" element={<ResultsPage />} />
                <Route path="/prestador/:id" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
