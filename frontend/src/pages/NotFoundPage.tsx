import { Link } from 'react-router-dom';

interface NotFoundPageProps {
  title?: string;
  text?: string;
}

export function NotFoundPage({
  title = 'Página não encontrada',
  text = 'O endereço que você abriu não existe.',
}: NotFoundPageProps) {
  return (
    <div className="sp-container sp-block">
      <div className="sp-empty">
        <h1 className="sp-empty__title">{title}</h1>
        <p className="sp-empty__text">{text}</p>
        <Link className="sp-btn sp-btn--primary sp-btn--md" to="/">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
