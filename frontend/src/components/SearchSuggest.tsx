import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { api, type SearchSuggestion } from '../lib/api';

const SUGGEST_DELAY_MS = 300;

export function useSearchSuggest(query: string, city: string) {
  const [items, setItems] = useState<SearchSuggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    const q = query.trim();
    setActive(-1);
    setDismissed(false);
    setItems([]);
    if (!q) return;

    const timer = window.setTimeout(() => {
      api
        .suggest(q, city)
        .then((next) => {
          if (seq.current !== id) return;
          setItems(next);
        })
        .catch(() => {
          if (seq.current !== id) return;
          setItems([]);
        });
    }, SUGGEST_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [query, city]);

  const open = focused && !dismissed && items.length > 0;

  const inputProps = (onPick: (item: SearchSuggestion) => void) => ({
    role: 'combobox' as const,
    'aria-expanded': open,
    'aria-controls': listId,
    'aria-autocomplete': 'list' as const,
    'aria-activedescendant':
      open && active >= 0 ? `${listId}-opt-${active}` : undefined,
    autoComplete: 'off' as const,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setDismissed(true);
        setActive(-1);
        return;
      }
      if (items.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setDismissed(false);
        setActive((index) => (index + 1) % items.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setDismissed(false);
        setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
        return;
      }
      if (event.key === 'Enter' && open && active >= 0) {
        event.preventDefault();
        onPick(items[active]);
      }
    },
  });

  return { items: open ? items : [], active, setActive, listId, inputProps };
}

export function SearchSuggestList({
  id,
  items,
  active,
  onActive,
  onPick,
}: {
  id: string;
  items: SearchSuggestion[];
  active: number;
  onActive: (index: number) => void;
  onPick: (item: SearchSuggestion) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul id={id} className="sp-suggest" role="listbox">
      {items.map((item, index) => (
        <li key={`${item.type}-${item.id ?? item.label}`} role="presentation">
          <button
            type="button"
            id={`${id}-opt-${index}`}
            className={`sp-suggest__item${index === active ? ' sp-suggest__item--on' : ''}`}
            role="option"
            aria-selected={index === active}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => onActive(index)}
            onClick={() => onPick(item)}
          >
            <span className="sp-suggest__label">{item.label}</span>
            <span className="sp-suggest__meta">
              {item.type === 'category' ? 'Categoria' : item.category}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
