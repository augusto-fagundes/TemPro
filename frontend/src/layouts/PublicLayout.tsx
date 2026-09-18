import { Link, Outlet, useLocation } from 'react-router-dom';

import { Brand } from '../components/Brand';
import { HeaderSearch } from '../components/HeaderSearch';
import { useAuth } from '../context/AuthProvider';

export function PublicLayout() {
  const { pathname } = useLocation();
  const { token } = useAuth();
  /* The hero owns the search on the landing page — showing a second field up
     here would be two ways to do the same thing. */
  const showSearch = pathname !== '/' && pathname !== '/entrar' && pathname !== '/cadastrar';
  /* The home's hero is white to the edges, so a rule under the header would
     draw a line across one continuous surface. Everywhere else the header
     floats over a grey page and still needs its edge. */
  const flush = pathname === '/';

  return (
    <div className="sp-app">
      <header
        className={`sp-header${showSearch ? ' sp-header--search' : ''}${
          flush ? ' sp-header--flush' : ''
        }`}
      >
        <div className="sp-header__inner">
          <Brand />
          {showSearch && <HeaderSearch />}
          <Link className="sp-headerlink" to={token ? '/painel' : '/entrar'}>
            {token ? 'Painel' : 'Área do prestador'}
          </Link>
        </div>
      </header>

      <main className="sp-main">
        <Outlet />
      </main>

      <footer className="sp-footer">
        <div className="sp-footer__inner">
          <span>TemPro · Vale do Rio Pardo</span>
          <Link className="sp-footer__link" to={token ? '/painel' : '/cadastrar'}>
            Cadastre seu serviço
          </Link>
        </div>
      </footer>
    </div>
  );
}
