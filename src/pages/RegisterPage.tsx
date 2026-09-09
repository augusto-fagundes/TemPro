import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CategoryField, OTHER_CATEGORY } from '../components/CategoryField';
import { CityPicker } from '../components/CityPicker';
import { useAuth } from '../context/AuthProvider';
import { useMeta } from '../context/CatalogProvider';
import { useToast } from '../context/ToastProvider';

export function RegisterPage() {
  const { register } = useAuth();
  const { serviceCategories } = useMeta();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);

  const resolvedCategory =
    category.trim() === OTHER_CATEGORY ? '' : category.trim();

  const submit = async () => {
    if (!resolvedCategory) {
      toast('Informe a categoria do seu negócio');
      return;
    }
    if (cities.length === 0) {
      toast('Selecione pelo menos uma cidade');
      return;
    }

    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        city: cities[0],
        cities,
        category: resolvedCategory,
      });
      toast('Conta criada');
      navigate('/painel', { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível cadastrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sp-container sp-block">
      <div className="sp-page sp-page--narrow">
        <h1 className="sp-page__title">Criar conta</h1>
        <p className="sp-page__lede">
          Cadastre seu negócio e publique seus serviços na sua cidade.
        </p>

        <form
          className="sp-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="reg-name">
              Nome do negócio
            </label>
            <input
              id="reg-name"
              className="sp-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="reg-email">
              E-mail
            </label>
            <input
              id="reg-email"
              className="sp-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="reg-password">
              Senha
            </label>
            <input
              id="reg-password"
              className="sp-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <CategoryField
            categories={serviceCategories}
            value={category}
            onChange={setCategory}
          />
          <CityPicker selected={cities} onChange={setCities} />
          <div className="sp-form__actions">
            <button
              type="submit"
              className="sp-btn sp-btn--primary sp-btn--lg"
              disabled={busy}
            >
              {busy ? 'Criando…' : 'Criar conta'}
            </button>
            <Link className="sp-btn sp-btn--outline sp-btn--lg" to="/entrar">
              Já tenho conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
