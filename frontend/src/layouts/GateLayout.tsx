import { Outlet } from 'react-router-dom';

import { Brand } from '../components/Brand';

export function GateLayout() {
  return (
    <div className="sp-gate">
      <header className="sp-gate__top">
        <Brand to="/bem-vindo" />
      </header>
      <main className="sp-gate__main">
        <Outlet />
      </main>
    </div>
  );
}
