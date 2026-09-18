import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';

export function WelcomePage() {
  const { token } = useAuth();
  const location = useLocation();

  if (token) return <Navigate to="/" replace />;

  return (
    <div className="sp-welcome">
      <h1 className="sp-welcome__title">TemPro</h1>
      <p className="sp-welcome__lede">
        Os prestadores de serviço da sua cidade, reunidos em um só lugar.
      </p>

      <div className="sp-choice-grid">
        <Link className="sp-choice" to="/cadastrar">
          <span className="sp-choice__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <rect x="4" y="7" width="16" height="14" rx="2" />
              <path d="M9 13h6M12 10v6" />
            </svg>
          </span>
          <span className="sp-choice__name">Sou prestador de serviço</span>
          <span className="sp-choice__text">
            Cadastre o que você faz e apareça nas buscas.
          </span>
        </Link>

        <Link className="sp-choice" to="/onboarding" state={location.state}>
          <span className="sp-choice__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span className="sp-choice__name">Sou cliente</span>
          <span className="sp-choice__text">
            Procure um profissional para o que você precisa.
          </span>
        </Link>
      </div>

      <p className="sp-welcome__alt">
        Já tem conta de prestador? <Link to="/entrar">Entrar</Link>
      </p>
    </div>
  );
}
