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

  return (
    <div className="sp-app">
      <header className={`sp-header${showSearch ? ' sp-header--search' : ''}`}>
        <div className="sp-header__inner">
          <Brand />
          {showSearch && <HeaderSearch />}
          <Link
            className="sp-btn sp-btn--outline sp-btn--sm"
            to={token ? '/painel' : '/entrar'}
          >
            {token ? 'Painel' : 'Área do prestador'}
          </Link>
        </div>
      </header>

      <main className="sp-main">
        <Outlet />
      </main>

      <footer className="sp-footer">
        <div className="sp-footer__inner">
          <span>Serviços Perto · Vale do Rio Pardo</span>
          <Link className="sp-footer__link" to={token ? '/painel' : '/cadastrar'}>
            Cadastre seu serviço
          </Link>
        </div>
      </footer>
    </div>
  );
}
