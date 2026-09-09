import { useEffect, useId, useRef, useState } from 'react';

import { api, type CityMatch } from '../lib/api';

interface CityPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

export function CityPicker({
  selected,
  onChange,
  label = 'Cidades que você atende',
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setBusy(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setBusy(true);
      api
        .searchCities(q)
        .then((cities) => {
          setResults(cities);
          setError(null);
        })
        .catch((err: unknown) => {
          setResults([]);
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível buscar as cidades',
          );
        })
        .finally(() => setBusy(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const add = (labelValue: string) => {
    if (selected.includes(labelValue)) return;
    onChange([...selected, labelValue]);
    setQuery('');
    setResults([]);
  };

  const remove = (labelValue: string) => {
    onChange(selected.filter((city) => city !== labelValue));
  };

  const visible = results.filter((city) => !selected.includes(city.label));

  return (
    <div className="sp-field">
      <span className="sp-field__label">{label}</span>
      <div className="sp-menu sp-menu--field" ref={root}>
        <div
          className={`sp-menu__trigger sp-menu__trigger--field sp-citypicker__field${open ? ' sp-menu__trigger--open' : ''}`}
        >
          <input
            className="sp-citypicker__input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (visible[0]) add(visible[0].label);
              }
            }}
            placeholder={
              selected.length > 0
                ? 'Buscar outra cidade'
                : 'Buscar cidade (ex.: Santa Cruz do Sul)'
            }
            aria-label={label}
            aria-expanded={open}
            aria-controls={menuId}
            autoComplete="off"
          />
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
        </div>

        {open && (
          <ul
            id={menuId}
            className="sp-menu__list"
            role="listbox"
            aria-label={label}
            aria-multiselectable
          >
            {query.trim().length < 2 && (
              <li className="sp-menu__empty" role="presentation">
                Digite pelo menos 2 letras para buscar no IBGE.
              </li>
            )}
            {query.trim().length >= 2 && busy && (
              <li className="sp-menu__empty" role="presentation">
                Buscando cidades…
              </li>
            )}
            {query.trim().length >= 2 && !busy && error && (
              <li className="sp-menu__empty" role="presentation">
                {error}
              </li>
            )}
            {query.trim().length >= 2 && !busy && !error && visible.length === 0 && (
              <li className="sp-menu__empty" role="presentation">
                Nenhuma cidade encontrada.
              </li>
            )}
            {visible.map((city) => (
              <li key={city.id} role="presentation">
                <button
                  type="button"
                  className="sp-menu__item"
                  role="option"
                  aria-selected={false}
                  onClick={() => add(city.label)}
                >
                  <span className="sp-menu__check" aria-hidden="true" />
                  {city.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <div className="sp-citypicker__chips">
          {selected.map((city) => (
            <button
              key={city}
              type="button"
              className="sp-chip sp-chip--on sp-citypicker__chip"
              onClick={() => remove(city)}
              aria-label={`Remover ${city}`}
            >
              {city}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      <p className="sp-field__hint">
        Pesquise e selecione todas as cidades em que você atende.
      </p>
    </div>
  );
}
