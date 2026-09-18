import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';
import { hasSeenGuestOnboarding, isAuthPath, isGatePath } from '../lib/guest';

export function RequireGuestIntro() {
  const { token } = useAuth();
  const location = useLocation();

  if (
    !token &&
    !hasSeenGuestOnboarding() &&
    !isGatePath(location.pathname) &&
    !isAuthPath(location.pathname)
  ) {
    return (
      <Navigate to="/bem-vindo" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
