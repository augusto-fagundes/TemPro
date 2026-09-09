import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { filtersFromParams, paramsFromFilters } from '../lib/urls';

/**
 * The app's single search field once you are past the landing page. The home
 * hero owns the search on `/`, so this is hidden there — one search box per
 * screen, never two.
 *
 * On the results page it edits the `q` param in place, keeping the filters
 * already applied; anywhere else it starts a fresh search.
 */
export function HeaderSearch() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const onResults = pathname === '/buscar';
  const current = onResults ? (params.get('q') ?? '') : '';
  const [draft, setDraft] = useState(current);

  useEffect(() => setDraft(current), [current]);

  const submit = () => {
    const base = filtersFromParams(onResults ? params : new URLSearchParams());
    const filters = {
      ...base,
      q: draft,
      /* A new query supersedes the categories, the mirror of the rule on the
         results page. Leaving them selected would label the list "Vidraceiro"
         while it shows the chaveiro that was just searched for. City, mode and
         price narrow a different axis, so they carry over. */
      categories: [],
    };
    const query = paramsFromFilters(filters).toString();
    navigate(query ? `/buscar?${query}` : '/buscar');
  };

  return (
    <form
      className="sp-headersearch"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <svg
        className="sp-headersearch__icon"
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        className="sp-headersearch__input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Buscar serviço, cidade ou nome"
        aria-label="Buscar serviço, cidade ou nome"
      />
      <button type="submit" className="sp-headersearch__go">
        Buscar
      </button>
    </form>
  );
}
