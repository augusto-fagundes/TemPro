/**
 * Line icons for the category tiles. Inline SVG on `currentColor`, so a tile
 * tints its icon by setting `color` — no icon dependency, no sprite to load.
 */
const PATHS: Record<string, string> = {
  Eletricista: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  Encanador: 'M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10Z',
  Pintor: 'M3 4.5h12v4.5H3zM15 6.75h4v4.5h-6v2.5M11 13.75h4V20h-4z',
  Vidraceiro: 'M4 4h16v16H4zM12 4v16M4 12h16',
  'Ar-condicionado':
    'M3 4.5h18V11H3zM7 8h10M7 15c1.8 0 1.8 2.5 3.6 2.5M13.4 15c1.8 0 1.8 2.5 3.6 2.5',
  Jardinagem: 'M12 21v-7M12 14c0-5 3.5-9 9-9 0 5-3.5 9-9 9ZM12 17c0-3.5-2.4-6.5-6-6.5 0 3.5 2.4 6.5 6 6.5Z',
  Informática: 'M4 5h16v10H4zM2 19h20',
  Limpeza:
    'M11 2.5 12.4 6.6 16.5 8l-4.1 1.4L11 13.5 9.6 9.4 5.5 8l4.1-1.4zM18 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  Chaveiro: 'M15.5 4a4.5 4.5 0 1 1-3.4 7.4L4 19.5V21h3v-2h2v-2h2l1.1-1.1A4.5 4.5 0 0 1 15.5 4Z',
};

const FALLBACK = 'M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z';

export function CategoryIcon({ category }: { category: string }) {
  return (
    <svg
      className="sp-cat__glyph"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[category] ?? FALLBACK} />
    </svg>
  );
}
