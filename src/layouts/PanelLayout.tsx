import { Link, NavLink, Outlet } from 'react-router-dom';

import { Avatar } from '../components/Avatar';
import { Brand } from '../components/Brand';
import { useAuth } from '../context/AuthProvider';
import { useMeta } from '../context/CatalogProvider';
import { useProfile } from '../context/ProfileProvider';
import { providerPath } from '../lib/urls';

const NAV = [
  { to: '/painel', label: 'Visão geral', end: true },
  { to: '/painel/servicos', label: 'Meus serviços', end: false },
  { to: '/painel/perfil', label: 'Meu perfil', end: false },
];

export function PanelLayout() {
  const { profile } = useProfile();
  const { signedInProviderId } = useMeta();
  const { logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sp-sidebar__link${isActive ? ' sp-sidebar__link--active' : ''}`;

  return (
    <div className="sp-panel">
      <aside className="sp-sidebar">
        <div className="sp-sidebar__top">
          <Brand to="/painel" />
        </div>

        <nav className="sp-sidebar__nav" aria-label="Painel do prestador">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            className="sp-sidebar__link"
            to={providerPath(signedInProviderId)}
          >
            Ver perfil público
          </Link>
        </nav>

        <div className="sp-sidebar__account">
          <Avatar
            name={profile.name}
            src={profile.photoUrl || undefined}
            size={36}
            radius={10}
          />
          <div className="sp-sidebar__who">
            <div className="sp-sidebar__name">{profile.name}</div>
            <div className="sp-sidebar__city">{profile.city}</div>
          </div>
        </div>

        <Link className="sp-sidebar__exit" to="/" onClick={logout}>
          Sair
        </Link>
      </aside>

      <main className="sp-panel__main">
        <Outlet />
      </main>
    </div>
  );
}
