import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';
import { Brand } from './Brand';

const CONTACT_EMAIL = 'augusto.kersting@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/augusto-kersting-fagundes/';

export function Footer() {
  const { token } = useAuth();

  return (
    <footer className="sp-footer">
      <div className="sp-footer__inner">
        <div className="sp-footer__about">
          <Brand />
          <p className="sp-footer__lede">
            Os prestadores de serviço da sua cidade, reunidos em um só lugar.
          </p>
        </div>

        <nav className="sp-footer__col" aria-label="Para prestadores">
          <h2 className="sp-footer__heading">Para prestadores</h2>
          <ul className="sp-footer__list">
            {token ? (
              <>
                <li>
                  <Link className="sp-footer__link" to="/painel">
                    Meu painel
                  </Link>
                </li>
                <li>
                  <Link className="sp-footer__link" to="/painel/servicos">
                    Meus serviços
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="sp-footer__link" to="/cadastrar">
                    Cadastre seu serviço
                  </Link>
                </li>
                <li>
                  <Link className="sp-footer__link" to="/entrar">
                    Entrar
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="sp-footer__col">
          <h2 className="sp-footer__heading">Contato</h2>
          <ul className="sp-footer__list">
            <li>
              <a className="sp-footer__link" href={`mailto:${CONTACT_EMAIL}`}>
                <svg
                  className="sp-footer__icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a
                className="sp-footer__link"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="sp-footer__icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 10v7M8 7v.01M12 17v-7M12 13a3 3 0 0 1 6 0v4" />
                </svg>
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="sp-footer__bar">
        <div className="sp-footer__bar-inner">
          <span>© {new Date().getFullYear()} TemPro</span>
        </div>
      </div>
    </footer>
  );
}
