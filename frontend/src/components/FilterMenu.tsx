import { useEffect, useId, useRef, useState } from 'react';

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
  onChange,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
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

      {open && (
        <ul
          id={menuId}
          className="sp-menu__list"
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
        >
          {clearLabel && (
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
          {options.map((option) => {
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
        </ul>
      )}
    </div>
  );
}
