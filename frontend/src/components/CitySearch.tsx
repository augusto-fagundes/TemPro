import { useEffect, useId, useRef, useState } from 'react';

import { api, type CityMatch } from '../lib/api';
import { shortCity } from '../lib/search';

interface CitySearchProps {
  /** Selected city label. */
  value: string;
  onChange: (city: string) => void;
  /**
   * `chip` sits in the filter row, `bar` in a boxed field, `plain` is bare
   * text under the home search field — a pin, the city and a chevron, with
   * no border or fill, so it cannot be mistaken for the field above it.
   */
  variant?: 'chip' | 'bar' | 'plain';
  active?: boolean;
  label?: string;
}

const MIN_QUERY = 2;

/**
 * One field: you type your city and pick it from the IBGE list. Nothing is
 * offered before you type — the catalogue's own cities are not a shortlist to
 * choose from, they are just the ones that happen to have someone today, and
 * leading with them would frame the question as "where can we serve you"
 * instead of "where are you".
 */
export function CitySearch({
  value,
  onChange,
  variant = 'chip',
  active = false,
  label = 'Cidade',
}: CitySearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<CityMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menuId = useId();

  const term = query.trim();

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* The field is only mounted while the menu is open, so focusing it here is
     what makes the control typeable the moment it is opened. */
  useEffect(() => {
    if (open) input.current?.focus();
    else {
      setQuery('');
      setRemote([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (term.length < MIN_QUERY) {
      setRemote([]);
      setError(null);
      setBusy(false);
      return;
    }

    setBusy(true);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      api
        .searchCities(term, 30)
        .then((cities) => {
          if (cancelled) return;
          setRemote(cities);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setRemote([]);
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível buscar as cidades',
          );
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 250);

    /* A keystroke lands mid-request often enough that dropping the stale
       response matters: without the flag the older, wider result set would
       overwrite the newer one. */
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term]);

  /* No "every city" row either: a plumber three states away is not a wider
     search, just a longer list of people who cannot come. */
  const options = term.length >= MIN_QUERY ? remote : [];

  useEffect(() => setCursor(0), [term, options.length]);

  const pick = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((current) => Math.min(current + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[cursor];
      if (option) pick(option.label);
    }
  };

  const summary = shortCity(value);
  const empty =
    term.length >= MIN_QUERY && !busy && !error && options.length === 0;

  const renderRow = (option: CityMatch, index: number) => (
    <li key={option.id} role="presentation">
      <button
        type="button"
        className={`sp-menu__item${option.label === value ? ' sp-menu__item--on' : ''}${
          index === cursor ? ' sp-menu__item--cursor' : ''
        }`}
        role="option"
        aria-selected={option.label === value}
        onMouseEnter={() => setCursor(index)}
        onClick={() => pick(option.label)}
      >
        {option.label}
      </button>
    </li>
  );

  return (
    <div
      className={`sp-menu sp-citysearch${
        variant === 'bar' ? ' sp-citysearch--bar' : ''
      }${variant === 'plain' ? ' sp-citysearch--plain' : ''}`}
      ref={root}
    >
      <button
        type="button"
        className={
          variant === 'plain'
            ? `sp-citylink sp-menu__trigger${open ? ' sp-citylink--open' : ''}`
            : variant === 'bar'
              ? `sp-menu__trigger sp-menu__trigger--field${open ? ' sp-menu__trigger--open' : ''}`
              : `sp-chip sp-menu__trigger${active ? ' sp-chip--on' : ''}${open ? ' sp-menu__trigger--open' : ''}`
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${label}: ${summary}`}
        onClick={() => setOpen((current) => !current)}
      >
        {variant === 'plain' && (
          <svg
            className="sp-citylink__pin"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
        )}
        <span className="sp-menu__summary">{summary}</span>
        <svg
          className="sp-menu__chevron"
          viewBox="0 0 12 8"
          width="12"
          height="8"
          aria-hidden="true"
        >
          <path
            d="M1 1.75 6 6.25 11 1.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="sp-menu__pop">
          <div className="sp-menu__search">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
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
              ref={input}
              className="sp-menu__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Digite o nome da cidade"
              aria-label="Buscar cidade"
              aria-controls={menuId}
              autoComplete="off"
            />
          </div>

          <ul
            id={menuId}
            className="sp-menu__scroll"
            role="listbox"
            aria-label={label}
          >
            {options.map((option, i) => renderRow(option, i))}

            {busy && (
              <li className="sp-menu__empty" role="presentation">
                Buscando cidades…
              </li>
            )}
            {!busy && error && (
              <li className="sp-menu__empty" role="presentation">
                {error}
              </li>
            )}
            {empty && (
              <li className="sp-menu__empty" role="presentation">
                Nenhuma cidade com esse nome.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
