import { useEffect, useId, useRef, useState } from 'react';

import { fold } from '../lib/search';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterMenuProps {
  label: string;
  summary: string;
  options: FilterOption[];
  selected: string[];
  multiple?: boolean;
  /** First row that clears the selection. */
  clearLabel?: string;
  active?: boolean;
  /** Full-width control for forms, instead of the compact filter chip. */
  variant?: 'chip' | 'field';
  /** Adds a field to type into, for lists too long to scan by scrolling. */
  searchable?: boolean;
  searchPlaceholder?: string;
  onChange: (next: string[]) => void;
}

export function FilterMenu({
  label,
  summary,
  options,
  selected,
  multiple = false,
  clearLabel,
  active = false,
  variant = 'chip',
  searchable = false,
  searchPlaceholder = 'Buscar',
  onChange,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menuId = useId();

  const term = fold(query);
  const visible = term
    ? options.filter((option) => fold(option.label).includes(term))
    : options;

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

  /* The field only exists while the menu is open, so focusing it here is what
     makes the control typeable the moment it opens. */
  useEffect(() => {
    if (open && searchable) input.current?.focus();
    if (!open) setQuery('');
  }, [open, searchable]);

  const toggle = (value: string) => {
    if (multiple) {
      const on = selected.includes(value);
      onChange(on ? selected.filter((item) => item !== value) : [...selected, value]);
      return;
    }
    onChange([value]);
    setOpen(false);
  };

  const clear = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <div className={`sp-menu${variant === 'field' ? ' sp-menu--field' : ''}`} ref={root}>
      <button
        type="button"
        className={
          variant === 'field'
            ? `sp-menu__trigger sp-menu__trigger--field${open ? ' sp-menu__trigger--open' : ''}`
            : `sp-chip sp-menu__trigger${active ? ' sp-chip--on' : ''}${open ? ' sp-menu__trigger--open' : ''}`
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
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

      {open &&
        (() => {
          const list = (
            <ul
              id={menuId}
              className={searchable ? 'sp-menu__scroll' : 'sp-menu__list'}
              role="listbox"
              aria-label={label}
              aria-multiselectable={multiple || undefined}
            >
              {/* While filtering, "everything" is not one of the matches. */}
              {clearLabel && !term && (
                <li role="presentation">
                  <button
                    type="button"
                    className={`sp-menu__item${selected.length === 0 ? ' sp-menu__item--on' : ''}`}
                    role="option"
                    aria-selected={selected.length === 0}
                    onClick={clear}
                  >
                    {multiple && (
                      <span className="sp-menu__check" aria-hidden="true" />
                    )}
                    {clearLabel}
                  </button>
                </li>
              )}
              {visible.map((option) => {
                const on = selected.includes(option.value);
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      className={`sp-menu__item${on ? ' sp-menu__item--on' : ''}`}
                      role="option"
                      aria-selected={on}
                      onClick={() => toggle(option.value)}
                    >
                      {multiple && (
                        <span className="sp-menu__check" aria-hidden="true" />
                      )}
                      {option.label}
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 && (
                <li className="sp-menu__empty" role="presentation">
                  Nada encontrado.
                </li>
              )}
            </ul>
          );

          if (!searchable) return list;

          return (
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
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    if (visible[0]) toggle(visible[0].value);
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  aria-controls={menuId}
                  autoComplete="off"
                />
              </div>
              {list}
            </div>
          );
        })()}
    </div>
  );
}
