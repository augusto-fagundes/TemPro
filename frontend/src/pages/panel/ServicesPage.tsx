import { Link } from 'react-router-dom';

import { APP_CONFIG } from '../../config';
import { useServices } from '../../context/ServicesProvider';
import { useToast } from '../../context/ToastProvider';
import { servicePrice } from '../../lib/pricing';

export function ServicesPage() {
  const { services, remove } = useServices();
  const toast = useToast();

  return (
    <div className="sp-page sp-page--wide">
      <div className="sp-page__head">
        <h1 className="sp-page__title">Meus serviços</h1>
        <Link
          className="sp-btn sp-btn--primary sp-btn--md"
          to="/painel/servicos/novo"
        >
          + Novo serviço
        </Link>
      </div>

      <div className="sp-list">
        {services.map((service) => (
          <article className="sp-svcrow" key={service.id}>
            <div className="sp-svcrow__main">
              <h2 className="sp-svcrow__name">{service.name}</h2>
              {service.description && (
                <p className="sp-svcrow__desc">{service.description}</p>
              )}
              <div className="sp-tags">
                <span className="sp-tag">{service.category}</span>
                <span className="sp-tag">{service.mode}</span>
              </div>
            </div>

            <div className="sp-svcrow__price">
              {APP_CONFIG.showPrices ? servicePrice(service) : 'Sob consulta'}
            </div>

            <div className="sp-svcrow__actions">
              <Link
                className="sp-btn sp-btn--outline sp-btn--sm"
                to={`/painel/servicos/${service.id}/editar`}
              >
                Editar
              </Link>
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-btn--danger sp-btn--sm"
                onClick={() => {
                  void remove(service.id)
                    .then(() => toast('Serviço excluído'))
                    .catch((err: unknown) =>
                      toast(
                        err instanceof Error
                          ? err.message
                          : 'Não foi possível excluir o serviço',
                      ),
                    );
                }}
              >
                Excluir
              </button>
            </div>
          </article>
        ))}

        {services.length === 0 && (
          <div className="sp-empty">
            <h2 className="sp-empty__title">Nenhum serviço cadastrado</h2>
            <p className="sp-empty__text">
              Cadastre um serviço para aparecer nas buscas.
            </p>
            <Link
              className="sp-btn sp-btn--primary sp-btn--md"
              to="/painel/servicos/novo"
            >
              Cadastrar serviço
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
