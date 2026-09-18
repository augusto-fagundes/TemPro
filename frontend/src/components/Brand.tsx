import { Link } from 'react-router-dom';

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link className="sp-brand" to={to}>
      <img className="sp-mark" src="/tempro-icon.png" alt="" />
      <span className="sp-brand__name">TemPro</span>
    </Link>
  );
}
