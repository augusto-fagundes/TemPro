import { Link } from 'react-router-dom';

import { useMeta } from '../../context/CatalogProvider';
import { useProfile } from '../../context/ProfileProvider';
import { useServices } from '../../context/ServicesProvider';
import { countLabel } from '../../lib/search';
import { providerPath } from '../../lib/urls';

/** First word of the business name, for the greeting. */
function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function OverviewPage() {
  const { services } = useServices();
  const { profile } = useProfile();
  const { signedInProviderId } = useMeta();

  const missing = [
    !profile.whatsapp && 'WhatsApp',
    !profile.about.trim() && 'texto “Sobre”',
    !profile.photoUrl && 'logo',
  ].filter(Boolean) as string[];

  return (
    <div className="sp-page">
      <h1 className="sp-page__title">Olá, {firstName(profile.name)} 👋</h1>
      <p className="sp-page__lede">
        Gerencie seu perfil e os serviços que você oferece.
      </p>

      <div className="sp-statgrid">
        <section className="sp-statcard">
          <h2 className="sp-statcard__title">Meu perfil</h2>
          <span className="sp-badge">Perfil publicado</span>
          <div className="sp-statcard__meta">
            {profile.category} · {profile.city}
          </div>
          <Link className="sp-btn sp-btn--outline sp-btn--md" to="/painel/perfil">
            Editar perfil
          </Link>
        </section>

        <section className="sp-statcard">
          <h2 className="sp-statcard__title">Meus serviços</h2>
          <div className="sp-statcard__meta">
            {countLabel(
              services.length,
              'serviço cadastrado',
              'serviços cadastrados',
            )}
          </div>
          <Link
            className="sp-btn sp-btn--outline sp-btn--md"
            to="/painel/servicos"
          >
            Gerenciar serviços
          </Link>
        </section>
      </div>

      {/* Concrete gaps beat a generic "complete your profile" nudge. */}
      {missing.length > 0 && (
        <div className="sp-notice">
          <div>
            <h2 className="sp-notice__title">Seu perfil pode render mais</h2>
            <p className="sp-notice__text">
              Falta preencher: {missing.join(', ')}.
            </p>
          </div>
          <Link className="sp-btn sp-btn--outline sp-btn--md" to="/painel/perfil">
            Completar
          </Link>
        </div>
      )}

      <Link
        className="sp-btn sp-btn--primary sp-btn--lg sp-page__cta"
        to={providerPath(signedInProviderId)}
      >
        Visualizar meu perfil público
      </Link>
    </div>
  );
}
