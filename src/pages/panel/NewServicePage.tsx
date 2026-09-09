import { Link, useNavigate } from 'react-router-dom';

import { ServiceForm } from '../../components/ServiceForm';
import { useServices } from '../../context/ServicesProvider';
import { useToast } from '../../context/ToastProvider';

export function NewServicePage() {
  const { add } = useServices();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <div className="sp-page sp-page--narrow">
      <Link className="sp-btn sp-btn--link sp-page__back" to="/painel/servicos">
        ← Meus serviços
      </Link>
      <h1 className="sp-page__title sp-page__title--form">Cadastrar serviço</h1>

      <ServiceForm
        submitLabel="Publicar serviço"
        cancelTo="/painel/servicos"
        onSubmit={(draft) => {
          void add(draft)
            .then(() => {
              toast('Serviço publicado');
              navigate('/painel/servicos');
            })
            .catch((err: unknown) =>
              toast(
                err instanceof Error
                  ? err.message
                  : 'Não foi possível publicar o serviço',
              ),
            );
        }}
      />
    </div>
  );
}
