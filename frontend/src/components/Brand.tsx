import { Link } from 'react-router-dom';

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link className="sp-brand" to={to}>
      <span className="sp-mark" aria-hidden="true" />
      <span className="sp-brand__name">Serviços Perto</span>
    </Link>
  );
}
