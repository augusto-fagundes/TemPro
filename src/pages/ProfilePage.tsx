import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../components/Avatar';
import { ImageSlot } from '../components/ImageSlot';
import { APP_CONFIG } from '../config';
import { useMeta } from '../context/CatalogProvider';
import { useCatalog } from '../context/ProfileProvider';
import { useServices } from '../context/ServicesProvider';
import { useToast } from '../context/ToastProvider';
import {
  instagramUrl,
  openExternal,
  phoneUrl,
  whatsappUrl,
} from '../lib/contact';
import { servicePrice } from '../lib/pricing';
import { searchPath } from '../lib/urls';
import type { Provider, Service } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function ProfilePage() {
  const { id } = useParams();
  const toast = useToast();
  const catalog = useCatalog();
  const { signedInProviderId } = useMeta();
  const { services: ownServices } = useServices();

  const provider = catalog.find((p) => p.id === id);

  if (!provider) {
    return (
      <NotFoundPage
        title="Prestador não encontrado"
        text="Esse perfil não existe ou saiu do ar."
      />
    );
  }

  /* The panel is the source of truth for the signed-in provider's services —
     otherwise "Visualizar meu perfil público" would show a different list
     from the one just edited under "Meus serviços". */
  const isMe = provider.id === signedInProviderId;
  const services: Service[] = isMe
    ? ownServices.map((service) => ({
        name: service.name,
        desc: service.description,
        mode: service.mode,
        price: servicePrice(service),
      }))
    : provider.services;

  const handOff = (url: string | null, fallback: string) => {
    if (!openExternal(url)) toast(fallback);
  };

  const contact = (p: Provider) => ({
    whats: () => handOff(whatsappUrl(p), `Abrindo WhatsApp de ${p.name}`),
    call: () => handOff(phoneUrl(p), `Ligando para ${p.name}`),
    insta: () => handOff(instagramUrl(p), `Abrindo Instagram de ${p.name}`),
  });

  const actions = contact(provider);
  const photos = provider.photos ?? [];

  return (
    <div className="sp-container sp-block">
      <nav className="sp-crumbs" aria-label="Você está em">
        <Link to="/">Início</Link>
        <span aria-hidden="true">/</span>
        <Link
          to={searchPath({
            categories: [provider.category],
            city: provider.city,
          })}
        >
          {provider.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="sp-crumbs__here">{provider.name}</span>
      </nav>

      {isMe && (
        <div className="sp-ownerbar">
          <span>Você está vendo seu perfil como os clientes veem.</span>
          <Link className="sp-btn sp-btn--outline sp-btn--sm" to="/painel/perfil">
            Editar perfil
          </Link>
        </div>
      )}

      <div className="sp-profile">
        <div className="sp-profile__main">
          <header className="sp-profile__head">
            <Avatar
              name={provider.name}
              src={provider.photoUrl}
              size={88}
              radius={20}
            />
            <div className="sp-profile__id">
              <h1 className="sp-profile__name">{provider.name}</h1>
              <div className="sp-profile__cat">{provider.category}</div>
              <div className="sp-profile__city">
                {(provider.cities && provider.cities.length > 0
                  ? provider.cities
                  : [provider.city]
                ).join(' · ')}
              </div>
              <div className="sp-badgerow">
                <span className="sp-badge">{provider.mode}</span>
              </div>
            </div>
          </header>

          {provider.about.trim() && (
            <section className="sp-section">
              <h2 className="sp-section__title">Sobre</h2>
              <p className="sp-prose">{provider.about}</p>
            </section>
          )}

          <section className="sp-section">
            <h2 className="sp-section__title">Serviços</h2>
            {services.length > 0 ? (
              <div className="sp-list">
                {services.map((service) => (
                  <article className="sp-svccard" key={service.name}>
                    <h3 className="sp-svccard__name">{service.name}</h3>
                    {service.desc && (
                      <p className="sp-svccard__desc">{service.desc}</p>
                    )}
                    <div className="sp-svccard__foot">
                      <span className="sp-tag">{service.mode}</span>
                      <span className="sp-price">
                        {APP_CONFIG.showPrices ? service.price : 'Sob consulta'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="sp-prose text-muted">
                Nenhum serviço publicado ainda.
              </p>
            )}
          </section>

          {/* No dashed placeholders on a public profile: an empty gallery
              reads as a broken page, while omitting it just means this
              provider has not posted photos yet. */}
          {APP_CONFIG.showGallery && photos.length > 0 && (
            <section className="sp-section">
              <h2 className="sp-section__title">Trabalhos realizados</h2>
              <div className="sp-gallery">
                {photos.map((src, i) => (
                  <ImageSlot
                    key={src}
                    className="sp-gallery__cell"
                    src={src}
                    placeholder={`Trabalho ${i + 1}`}
                    radius={14}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="sp-profile__aside">
          <div className="sp-contactcard">
            <h2 className="sp-contactcard__title">Falar com {provider.name}</h2>

            <button
              type="button"
              className="sp-btn sp-btn--primary sp-btn--lg sp-btn--block"
              onClick={actions.whats}
            >
              WhatsApp
            </button>
            <div className="sp-contactcard__row">
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-btn--md sp-btn--grow"
                onClick={actions.call}
              >
                Ligar
              </button>
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-btn--md sp-btn--grow"
                onClick={actions.insta}
              >
                Instagram
              </button>
            </div>

            <div className="sp-facts">
              <div className="sp-facts__row">
                <span className="sp-facts__k">Região atendida</span>
                <span className="sp-facts__v">
                  {(provider.cities && provider.cities.length > 0
                    ? provider.cities
                    : [provider.city]
                  ).join(' · ')}
                </span>
              </div>
              <div className="sp-facts__rule" />
              <div className="sp-facts__row">
                <span className="sp-facts__k">Forma</span>
                <span className="sp-facts__v">{provider.mode}</span>
              </div>
              {provider.address && (
                <>
                  <div className="sp-facts__rule" />
                  <div className="sp-facts__row">
                    <span className="sp-facts__k">Endereço</span>
                    <span className="sp-facts__v">{provider.address}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
