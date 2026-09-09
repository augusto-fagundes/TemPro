import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';

export function LoginPage() {
  const { login, token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from.startsWith('/painel')
      ? (location.state as { from: string }).from
      : '/painel';

  const [email, setEmail] = useState('joao@tempro.local');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/painel" replace />;

  const submit = async () => {
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast('Bem-vindo de volta');
      navigate(from, { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível entrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sp-container sp-block">
      <div className="sp-page sp-page--narrow">
        <h1 className="sp-page__title">Entrar</h1>
        <p className="sp-page__lede">
          Acesse o painel para publicar seus serviços.
        </p>

        <form
          className="sp-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="login-email">
              E-mail
            </label>
            <input
              id="login-email"
              className="sp-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="login-password">
              Senha
            </label>
            <input
              id="login-password"
              className="sp-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className="sp-field__hint">
            Demo: <code>joao@tempro.local</code> / <code>joao1234</code>
          </p>
          <div className="sp-form__actions">
            <button
              type="submit"
              className="sp-btn sp-btn--primary sp-btn--lg"
              disabled={busy}
            >
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
            <Link className="sp-btn sp-btn--outline sp-btn--lg" to="/cadastrar">
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
