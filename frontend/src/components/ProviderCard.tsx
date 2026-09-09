import { Link } from 'react-router-dom';

import { APP_CONFIG } from '../config';
import { providerPath } from '../lib/urls';
import type { Provider } from '../types';
import { Avatar } from './Avatar';

interface ProviderCardProps {
  provider: Provider;
  onWhatsApp: (provider: Provider) => void;
}

/** The one provider summary used by the home feed and the results list. */
export function ProviderCard({ provider, onWhatsApp }: ProviderCardProps) {
  /* Every card carries a price line. A provider who published no price reads
     as "Sob consulta" rather than leaving a hole where the others show a
     number — the row stays comparable down the list. */
  const price = provider.price || 'Preço sob consulta';

  return (
    <article className="sp-pcard">
      <div className="sp-pcard__head">
        <Avatar name={provider.name} src={provider.photoUrl} />
        <div className="sp-pcard__id">
          <h3 className="sp-pcard__name">
            {/* Stretched link: the whole card is the target, but the buttons
                below sit above it and stay independently clickable. */}
            <Link className="sp-pcard__link" to={providerPath(provider.id)}>
              {provider.name}
            </Link>
          </h3>
          <div className="sp-pcard__cat">{provider.category}</div>
        </div>
      </div>

      <p className="sp-pcard__desc">{provider.desc}</p>

      <div className="sp-tags">
        <span className="sp-tag">{provider.city}</span>
        <span className="sp-tag">{provider.mode}</span>
      </div>

      {APP_CONFIG.showPrices && (
        <div className={`sp-price${provider.price ? '' : ' sp-price--muted'}`}>
          {price}
        </div>
      )}

      <div className="sp-pcard__actions">
        <Link
          className="sp-btn sp-btn--outline sp-btn--md sp-btn--grow"
          to={providerPath(provider.id)}
        >
          Ver perfil
        </Link>
        <button
          type="button"
          className="sp-btn sp-btn--primary sp-btn--md sp-btn--grow"
          onClick={() => onWhatsApp(provider)}
        >
          WhatsApp
        </button>
      </div>
    </article>
  );
}
