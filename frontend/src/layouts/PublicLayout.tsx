import { Link, Outlet, useLocation } from 'react-router-dom';

import { Brand } from '../components/Brand';
import { Footer } from '../components/Footer';
import { HeaderSearch } from '../components/HeaderSearch';
import { useAuth } from '../context/AuthProvider';

export function PublicLayout() {
  const { pathname } = useLocation();
  const { token } = useAuth();
  /* A provider profile is about one person — keep a slim brand bar, drop
     discovery chrome and the provider login invite. */
  const isProviderProfile = pathname.startsWith('/prestador/');
  /* The hero owns the search on the landing page — showing a second field up
     here would be two ways to do the same thing. */
  const showSearch =
    !isProviderProfile &&
    pathname !== '/' &&
    pathname !== '/entrar' &&
    pathname !== '/cadastrar';
  /* The home's hero is white to the edges, so a rule under the header would
     draw a line across one continuous surface. Everywhere else the header
     floats over a grey page and still needs its edge. */
  const flush = pathname === '/';
  /* Accounts only exist for providers, so no token on the home means a client
     browsing — inviting them into the provider area is noise. */
  const showHeaderLink = !isProviderProfile && (token || pathname !== '/');

  return (
    <div className="sp-app">
      <header
        className={`sp-header${showSearch ? ' sp-header--search' : ''}${
          flush ? ' sp-header--flush' : ''
        }${isProviderProfile ? ' sp-header--compact' : ''}`}
      >
        <div className="sp-header__inner">
          <Brand />
          {showSearch && <HeaderSearch />}
          {showHeaderLink && (
            <Link className="sp-headerlink" to={token ? '/painel' : '/entrar'}>
              {token ? 'Painel' : 'Área do prestador'}
            </Link>
          )}
        </div>
      </header>

      <main className="sp-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
