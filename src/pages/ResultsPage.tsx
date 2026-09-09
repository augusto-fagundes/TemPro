import { useSearchParams } from 'react-router-dom';

import { FilterMenu } from '../components/FilterMenu';
import { ProviderCard } from '../components/ProviderCard';
import { useMeta } from '../context/CatalogProvider';
import { useCatalog } from '../context/ProfileProvider';
import { useToast } from '../context/ToastProvider';
import { openExternal, whatsappUrl } from '../lib/contact';
import { countLabel, resultsTitle, searchProviders } from '../lib/search';
import { filtersFromParams, paramsFromFilters } from '../lib/urls';
import type { ModeFilter, Provider, SearchFilters } from '../types';
import { ALL_CITIES } from '../types';

const MODES: ModeFilter[] = [
  'Todos',
  'Atende em domicílio',
  'Possui estabelecimento',
  'Ambos',
];

export function ResultsPage() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const catalog = useCatalog();
  const { cities: CITIES, categories: FILTER_CATEGORIES } = useMeta();
  const results = searchProviders(catalog, filters);
  const toast = useToast();

  const apply = (patch: Partial<SearchFilters>) => {
    setParams(paramsFromFilters({ ...filters, ...patch }));
  };

  const setCategories = (next: string[]) => {
    apply({ categories: next, q: '' });
  };

  const categorySummary = () => {
    const picked = filters.categories;
    if (picked.length === 0) return 'Todas as categorias';
    if (picked.length === 1) return picked[0];
    if (picked.length === 2) return `${picked[0]} e ${picked[1]}`;
    return `${picked[0]} +${picked.length - 1}`;
  };

  const clearAll = () =>
    apply({ q: '', categories: [], mode: 'Todos', priceOnly: false });

  const openWhatsApp = (provider: Provider) => {
    if (!openExternal(whatsappUrl(provider))) {
      toast(`Abrindo WhatsApp de ${provider.name}`);
    }
  };

  const narrowed =
    filters.q !== '' ||
    filters.categories.length > 0 ||
    filters.mode !== 'Todos' ||
    filters.priceOnly;

  return (
    <div className="sp-container sp-block">
      <header className="sp-results__head">
        <h1 className="sp-results__title">{resultsTitle(filters, catalog)}</h1>
        {/* At zero the empty state below already says so — no need to say it
            twice in different words. */}
        {results.length > 0 && (
          <p className="sp-results__count">
            {countLabel(
              results.length,
              'profissional encontrado',
              'profissionais encontrados',
            )}
          </p>
        )}
      </header>

      {/* The query itself lives in the header search — these narrow it down. */}
      <div className="sp-filters">
        <div className="sp-filters__row">
          <FilterMenu
            label="Categoria"
            summary={categorySummary()}
            multiple
            clearLabel="Todas as categorias"
            active={filters.categories.length > 0}
            selected={filters.categories}
            options={FILTER_CATEGORIES.map((name) => ({
              value: name,
              label: name,
            }))}
            onChange={setCategories}
          />

          <FilterMenu
            label="Cidade"
            summary={filters.city}
            selected={[filters.city]}
            options={CITIES.map((city) => ({ value: city, label: city }))}
            onChange={(next) => apply({ city: next[0] ?? ALL_CITIES })}
          />

          <FilterMenu
            label="Forma de atendimento"
            summary={
              filters.mode === 'Todos' ? 'Qualquer atendimento' : filters.mode
            }
            active={filters.mode !== 'Todos'}
            selected={[filters.mode]}
            options={MODES.map((mode) => ({
              value: mode,
              label: mode === 'Todos' ? 'Qualquer atendimento' : mode,
            }))}
            onChange={(next) =>
              apply({ mode: (next[0] as ModeFilter) ?? 'Todos' })
            }
          />

          <button
            type="button"
            className={`sp-chip${filters.priceOnly ? ' sp-chip--on' : ''}`}
            aria-pressed={filters.priceOnly}
            onClick={() => apply({ priceOnly: !filters.priceOnly })}
          >
            Com preço informado
          </button>

          {narrowed && (
            <button
              type="button"
              className="sp-btn sp-btn--link sp-filters__clear"
              onClick={clearAll}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="sp-grid">
          {results.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onWhatsApp={openWhatsApp}
            />
          ))}
        </div>
      ) : (
        <div className="sp-empty">
          <h2 className="sp-empty__title">Nenhum profissional encontrado</h2>
          <p className="sp-empty__text">
            Ninguém atende essa combinação por aqui. Tente ampliar a busca:
          </p>
          <div className="sp-empty__actions">
            {filters.city !== ALL_CITIES && (
              <button
                type="button"
                className="sp-btn sp-btn--primary sp-btn--md"
                onClick={() => apply({ city: ALL_CITIES })}
              >
                Buscar em todas as cidades
              </button>
            )}
            {narrowed && (
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-btn--md"
                onClick={clearAll}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
