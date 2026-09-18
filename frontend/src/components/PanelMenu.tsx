import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export interface PanelMenuItem {
  to: string;
  label: string;
  /** Matches the path exactly, for the index route. */
  end?: boolean;
}

interface PanelMenuProps {
  items: PanelMenuItem[];
  onSignOut: () => void;
}

/**
 * The panel's navigation on a phone: an icon button opening a menu of the
 * panel's screens. It replaces a tab strip that wrapped to two rows at 390px;
 * the desktop rail keeps the tabs and hides this.
 */
export function PanelMenu({ items, onSignOut }: PanelMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { pathname } = useLocation();

  /* Navigating is the menu's whole purpose, so arriving anywhere closes it —
     otherwise it would still be hanging over the screen it just opened. */
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      /* Focus would otherwise be left on a node that just disappeared,
         dropping a keyboard user back at the top of the document. */
      trigger.current?.focus();
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="sp-menu sp-panelmenu" ref={root}>
      <button
        type="button"
        ref={trigger}
        className={`sp-panelmenu__trigger${open ? ' sp-panelmenu__trigger--open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        /* The icon carries no text, so the button is named here — otherwise a
           screen reader announces an unlabelled button. */
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="sp-menu__pop sp-panelmenu__pop" id={menuId} role="menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              role="menuitem"
              className={({ isActive }) =>
                `sp-menu__item sp-panelmenu__item${
                  isActive ? ' sp-menu__item--on' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="sp-panelmenu__rule" />

          <button
            type="button"
            role="menuitem"
            className="sp-menu__item sp-panelmenu__item sp-panelmenu__exit"
            onClick={onSignOut}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
