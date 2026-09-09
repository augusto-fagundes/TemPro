import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar } from '../../components/Avatar';
import { CategoryField, OTHER_CATEGORY } from '../../components/CategoryField';
import { CityPicker } from '../../components/CityPicker';
import { useMeta } from '../../context/CatalogProvider';
import { useProfile } from '../../context/ProfileProvider';
import { useToast } from '../../context/ToastProvider';
import { providerPath } from '../../lib/urls';
import type { ProviderMode, ProviderProfile } from '../../types';
import { PROVIDER_MODES } from '../../types';

export function MyProfilePage() {
  const { profile, update, reset } = useProfile();
  const { serviceCategories, signedInProviderId } = useMeta();
  const toast = useToast();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<ProviderProfile>({
    ...profile,
    cities:
      profile.cities && profile.cities.length > 0
        ? profile.cities
        : profile.city
          ? [profile.city]
          : [],
  });
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof ProviderProfile>(
    key: K,
    value: ProviderProfile[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const nameError = touched && draft.name.trim() === '';
  /* Only a business with a counter has an address to publish. */
  const showsAddress = draft.mode !== 'Atende em domicílio';

  const submit = async () => {
    setTouched(true);
    if (draft.name.trim() === '') return;
    const category =
      draft.category.trim() === OTHER_CATEGORY ? '' : draft.category.trim();
    const cities = draft.cities.length > 0 ? draft.cities : [draft.city];
    if (!category) {
      toast('Informe a categoria do seu negócio');
      return;
    }
    if (cities.length === 0 || !cities[0]) {
      toast('Selecione pelo menos uma cidade');
      return;
    }
    try {
      await update({
        ...draft,
        name: draft.name.trim(),
        category,
        city: cities[0],
        cities,
        address: showsAddress ? draft.address.trim() : '',
        whatsapp: draft.whatsapp.replace(/\D/g, ''),
        phone: draft.phone.trim(),
        instagram: draft.instagram.trim().replace(/^@/, ''),
        photoUrl: draft.photoUrl.trim(),
      });
      toast('Perfil atualizado');
      navigate('/painel');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar o perfil');
    }
  };

  return (
    <div className="sp-page sp-page--narrow">
      <Link className="sp-btn sp-btn--link sp-page__back" to="/painel">
        ← Visão geral
      </Link>
      <div className="sp-page__head">
        <h1 className="sp-page__title">Meu perfil</h1>
        <Link
          className="sp-btn sp-btn--outline sp-btn--sm"
          to={providerPath(signedInProviderId)}
        >
          Ver perfil público
        </Link>
      </div>

      <form
        className="sp-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="sp-logofield">
          <Avatar name={draft.name || '?'} src={draft.photoUrl} size={72} radius={18} />
          <div className="sp-logofield__body">
            <label className="sp-field__label" htmlFor="pf-logo">
              Logo
            </label>
            <input
              id="pf-logo"
              className="sp-input"
              value={draft.photoUrl}
              onChange={(e) => set('photoUrl', e.target.value)}
              placeholder="https://…"
            />
            <p className="sp-field__hint">
              Cole o link de uma imagem. Sem logo, seu perfil usa as iniciais do
              nome.
            </p>
          </div>
        </div>

        <div className="sp-field">
          <label className="sp-field__label" htmlFor="pf-name">
            Nome do negócio
          </label>
          <input
            id="pf-name"
            className={`sp-input${nameError ? ' sp-input--error' : ''}`}
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={nameError}
            aria-describedby={nameError ? 'pf-name-error' : undefined}
          />
          {nameError && (
            <p className="sp-field__error" id="pf-name-error">
              O nome é o que aparece na busca — não pode ficar vazio.
            </p>
          )}
        </div>

        <CategoryField
          label="Categoria principal"
          categories={serviceCategories}
          value={draft.category}
          onChange={(value) => set('category', value)}
        />
        <CityPicker
          selected={draft.cities.length > 0 ? draft.cities : [draft.city].filter(Boolean)}
          onChange={(cities) => {
            setDraft((current) => ({
              ...current,
              cities,
              city: cities[0] ?? '',
            }));
          }}
        />

        <div className="sp-field">
          <label className="sp-field__label" htmlFor="pf-desc">
            Resumo
          </label>
          <input
            id="pf-desc"
            className="sp-input"
            value={draft.desc}
            onChange={(e) => set('desc', e.target.value)}
            maxLength={90}
            placeholder="Instalações, manutenção elétrica e reparos residenciais."
          />
          <p className="sp-field__hint">
            Uma linha, mostrada no seu card na busca. {90 - draft.desc.length}{' '}
            caracteres restantes.
          </p>
        </div>

        <div className="sp-field">
          <label className="sp-field__label" htmlFor="pf-about">
            Sobre
          </label>
          <textarea
            id="pf-about"
            className="sp-textarea"
            value={draft.about}
            onChange={(e) => set('about', e.target.value)}
          />
          <p className="sp-field__hint">
            O texto que abre o seu perfil público.
          </p>
        </div>

        <fieldset className="sp-fieldset">
          <legend className="sp-field__label sp-field__label--roomy">
            Forma de atendimento
          </legend>
          <div className="sp-chiprow">
            {PROVIDER_MODES.map((option: ProviderMode) => (
              <button
                key={option}
                type="button"
                className={`sp-chip sp-chip--form${draft.mode === option ? ' sp-chip--on' : ''}`}
                aria-pressed={draft.mode === option}
                onClick={() => set('mode', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        {showsAddress && (
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="pf-address">
              Endereço
            </label>
            <input
              id="pf-address"
              className="sp-input"
              value={draft.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua Marechal Floriano, 480 - Centro"
            />
          </div>
        )}

        <fieldset className="sp-fieldset">
          <legend className="sp-field__label sp-field__label--roomy">
            Contato
          </legend>
          <div className="sp-fieldrow">
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="pf-whats">
                WhatsApp
              </label>
              <input
                id="pf-whats"
                className="sp-input"
                inputMode="tel"
                value={draft.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="5551999998888"
              />
            </div>
            <div className="sp-field">
              <label className="sp-field__label" htmlFor="pf-phone">
                Telefone
              </label>
              <input
                id="pf-phone"
                className="sp-input"
                inputMode="tel"
                value={draft.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+55 51 99999-8888"
              />
            </div>
          </div>
          <div className="sp-field">
            <label className="sp-field__label" htmlFor="pf-insta">
              Instagram
            </label>
            <input
              id="pf-insta"
              className="sp-input"
              value={draft.instagram}
              onChange={(e) => set('instagram', e.target.value)}
              placeholder="joaoeletrica"
            />
          </div>
          <p className="sp-field__hint">
            Cada campo preenchido liga o botão correspondente no seu perfil.
            Vazio, o botão só avisa que o contato não foi informado.
          </p>
        </fieldset>

        <div className="sp-form__actions">
          <button type="submit" className="sp-btn sp-btn--primary sp-btn--lg">
            Salvar perfil
          </button>
          <Link className="sp-btn sp-btn--outline sp-btn--lg" to="/painel">
            Cancelar
          </Link>
        </div>
      </form>

      <div className="sp-danger">
        <div>
          <h2 className="sp-danger__title">Restaurar dados originais</h2>
          <p className="sp-danger__text">
            Volta o perfil ao cadastro de exemplo, descartando suas alterações.
          </p>
        </div>
        <button
          type="button"
          className="sp-btn sp-btn--outline sp-btn--danger sp-btn--md"
          onClick={() => {
            void reset()
              .then(() => {
                toast('Perfil restaurado');
                navigate('/painel');
              })
              .catch((err: unknown) =>
                toast(
                  err instanceof Error
                    ? err.message
                    : 'Não foi possível restaurar o perfil',
                ),
              );
          }}
        >
          Restaurar
        </button>
      </div>
    </div>
  );
}
