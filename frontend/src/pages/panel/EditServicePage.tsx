import { Link, useNavigate, useParams } from 'react-router-dom';

import { ServiceForm } from '../../components/ServiceForm';
import { useServices } from '../../context/ServicesProvider';
import { useToast } from '../../context/ToastProvider';

export function EditServicePage() {
  const { id } = useParams();
  const { find, update, remove } = useServices();
  const toast = useToast();
  const navigate = useNavigate();

  const service = find(Number(id));

  if (!service) {
    return (
      <div className="sp-page sp-page--narrow">
        <div className="sp-empty">
          <h1 className="sp-empty__title">Serviço não encontrado</h1>
          <p className="sp-empty__text">
            Ele pode ter sido excluído em outra aba.
          </p>
          <Link className="sp-btn sp-btn--primary sp-btn--md" to="/painel/servicos">
            Voltar para meus serviços
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-page sp-page--narrow">
      <Link className="sp-btn sp-btn--link sp-page__back" to="/painel/servicos">
        ← Meus serviços
      </Link>
      <h1 className="sp-page__title sp-page__title--form">Editar serviço</h1>

      <ServiceForm
        /* Remounts when the row changes, so the fields reload instead of
           keeping the previous service's draft. */
        key={service.id}
        initial={service}
        submitLabel="Salvar alterações"
        cancelTo="/painel/servicos"
        onSubmit={(draft) => {
          void update(service.id, draft)
            .then(() => {
              toast('Serviço atualizado');
              navigate('/painel/servicos');
            })
            .catch((err: unknown) =>
              toast(
                err instanceof Error
                  ? err.message
                  : 'Não foi possível salvar o serviço',
              ),
            );
        }}
      />

      <div className="sp-danger">
        <div>
          <h2 className="sp-danger__title">Excluir serviço</h2>
          <p className="sp-danger__text">
            Ele sai das buscas e do seu perfil na hora. Não dá para desfazer.
          </p>
        </div>
        <button
          type="button"
          className="sp-btn sp-btn--outline sp-btn--danger sp-btn--md"
          onClick={() => {
            void remove(service.id)
              .then(() => {
                toast('Serviço excluído');
                navigate('/painel/servicos');
              })
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
    </div>
  );
}
