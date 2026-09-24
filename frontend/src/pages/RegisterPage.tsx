import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { CategoryField, OTHER_CATEGORY } from '../components/CategoryField';
import { CityPicker } from '../components/CityPicker';
import { useAuth } from '../context/AuthProvider';
import { useMeta } from '../context/CatalogProvider';
import { useToast } from '../context/ToastProvider';
import { markGuestOnboarded } from '../lib/guest';
import { formatPrice } from '../lib/pricing';
import type { PriceType, ServiceMode } from '../types';
import { PRICE_TYPES, SERVICE_MODES } from '../types';

/**
 * Formats a celular as it is typed: "(51) 99999-8888". Rebuilt from the
 * digits every keystroke rather than by inserting separators in place, so
 * backspace, paste and typing all go through the same path.
 *
 * Separators are only added once a digit needs them — "(51" stays open until
 * there is a third digit. Closing it earlier makes backspace look stuck: the
 * ")" would be deleted and then immediately re-added.
 */
function maskMobile(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  /* A pasted "+55 51 99999-8888" carries a country code the mask has no slot
     for. Dropping it beats shifting it into the DDD, which would silently
     turn a valid number into "(55) 51999-9888". */
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  digits = digits.slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * A celular is 11 digits once the DDD is counted. The mask cannot produce a
 * landline's 10, but it can still be short, and the number is what the
 * WhatsApp button on the listing will dial. The API also takes the same
 * number with a 55 in front; this field strips that rather than sending it.
 */
function isBrazilianMobile(digits: string): boolean {
  return digits.length === 11;
}

export function RegisterPage() {
  const { register } = useAuth();
  const { serviceCategories } = useMeta();
  const toast = useToast();
  const navigate = useNavigate();
  /* Arriving from the "ainda não há prestadores em X" empty state, the city
     that was just searched for is the one being signed up for — starting the
     picker empty would make the person type it a second time. */
  const { state } = useLocation() as { state: { city?: string } | null };

  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cities, setCities] = useState<string[]>(
    state?.city ? [state.city] : [],
  );
  const [category, setCategory] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('Em domicílio');
  const [priceType, setPriceType] = useState<PriceType>('Sob consulta');
  const [priceAmount, setPriceAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const resolvedCategory =
    category.trim() === OTHER_CATEGORY ? '' : category.trim();
  const mobileDigits = mobile.replace(/\D/g, '');

  const submit = async () => {
    /* `required` already covers an empty field; what it cannot catch is a
       number too short to call back on. Checked here so the person is told
       before the round trip, with the same rule the API enforces. */
    if (!isBrazilianMobile(mobileDigits)) {
      toast('Informe um celular com DDD — ex.: (51) 99999-8888');
      return;
    }
    if (!resolvedCategory) {
      toast('Informe a categoria do seu negócio');
      return;
    }
    if (cities.length === 0) {
      toast('Selecione pelo menos uma cidade');
      return;
    }
    if (!serviceName.trim()) {
      toast('Dê um nome ao serviço para publicá-lo');
      return;
    }

    setBusy(true);
    try {
      await register({
        name: name.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobileDigits,
        email: email.trim(),
        password,
        city: cities[0],
        cities,
        category: resolvedCategory,
        service: {
          name: serviceName.trim(),
          category: resolvedCategory,
          description: serviceDescription.trim(),
          mode: serviceMode,
          priceType,
          priceAmount: priceType === 'Sob consulta' ? '' : priceAmount.trim(),
        },
      });
      markGuestOnboarded();
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
      <div className="sp-page sp-auth">
        <Link className="sp-page__back" to="/bem-vindo">
          ← Voltar
        </Link>
        <div className="sp-auth__head">
          <h1 className="sp-page__title">Criar conta de prestador</h1>
        </div>

        <form
          className="sp-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {/* Two things are being filled in at once — the credentials to get
              back in, and the listing people will see. Saying which is which
              keeps a seven-field form from reading as one undifferentiated
              stack, and puts the business name next to the category and
              cities it belongs with rather than among the personal details. */}
          <fieldset className="sp-form__group">
            <legend className="sp-form__legend">Sua conta</legend>
            {/* First and last name side by side: two short fields stacked read
                as two steps when they are one. */}
            <div className="sp-fieldrow">
              <div className="sp-field">
                <label className="sp-field__label" htmlFor="reg-first-name">
                  Primeiro nome
                </label>
                <input
                  id="reg-first-name"
                  className="sp-input"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="sp-field">
                <label className="sp-field__label" htmlFor="reg-last-name">
                  Sobrenome
                </label>
                <input
                  id="reg-last-name"
                  className="sp-input"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="reg-mobile">
                Celular
              </label>
              <input
                id="reg-mobile"
                className="sp-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={mobile}
                onChange={(e) => setMobile(maskMobile(e.target.value))}
                placeholder="(51) 99999-8888"
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
          </fieldset>

          <fieldset className="sp-form__group">
            <legend className="sp-form__legend">Seu negócio</legend>
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="reg-name">
                Nome do negócio
              </label>
              <input
                id="reg-name"
                className="sp-input"
                autoComplete="organization"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <CategoryField
              categories={serviceCategories}
              value={category}
              onChange={setCategory}
            />
            <CityPicker selected={cities} onChange={setCities} />
          </fieldset>

          {/* Without a first service the public profile is an empty shell —
              collect it here so the listing is usable the moment the account
              exists. Category follows the business; mode and price match the
              panel form defaults. */}
          <fieldset className="sp-form__group">
            <legend className="sp-form__legend">Primeiro serviço</legend>
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="reg-service-name">
                Nome do serviço
              </label>
              <input
                id="reg-service-name"
                className="sp-input"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Instalação elétrica residencial"
                required
              />
            </div>
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="reg-service-desc">
                Descrição
              </label>
              <textarea
                id="reg-service-desc"
                className="sp-textarea"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Instalações e manutenção elétrica residencial."
              />
              <p className="sp-field__hint">Aparece abaixo do nome no seu perfil.</p>
            </div>
            <fieldset className="sp-fieldset">
              <legend className="sp-field__label sp-field__label--roomy">
                Forma de atendimento
              </legend>
              <div className="sp-chiprow">
                {SERVICE_MODES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`sp-chip sp-chip--form${serviceMode === option ? ' sp-chip--on' : ''}`}
                    aria-pressed={serviceMode === option}
                    onClick={() => setServiceMode(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="sp-fieldset">
              <legend className="sp-field__label sp-field__label--roomy">
                Preço (opcional)
              </legend>
              <div className="sp-chiprow">
                {PRICE_TYPES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`sp-chip sp-chip--form${priceType === option ? ' sp-chip--on' : ''}`}
                    aria-pressed={priceType === option}
                    onClick={() => setPriceType(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {priceType !== 'Sob consulta' && (
                <input
                  className="sp-input sp-priceinput"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="150"
                  aria-label="Valor em reais"
                />
              )}
              <p className="sp-field__hint">
                Aparecerá como{' '}
                <strong>{formatPrice(priceType, priceAmount)}</strong>.
              </p>
            </fieldset>
          </fieldset>

          <div className="sp-form__actions sp-form__actions--stack">
            <button
              type="submit"
              className="sp-btn sp-btn--primary sp-btn--lg"
              disabled={busy}
            >
              {busy ? 'Criando…' : 'Criar conta'}
            </button>
          </div>
        </form>

        {/* Signing in is the other screen, not the other half of this one: as
            a button of equal weight it competed with the one action this page
            exists for. */}
        <p className="sp-auth__alt">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
