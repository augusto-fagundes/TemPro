import { Link, useSearchParams } from 'react-router-dom';

import { CitySearch } from '../components/CitySearch';
import { FilterMenu } from '../components/FilterMenu';
import { ProviderCard } from '../components/ProviderCard';
import { useMeta } from '../context/CatalogProvider';
import { useCatalog } from '../context/ProfileProvider';
import { useToast } from '../context/ToastProvider';
import { openExternal, whatsappUrl } from '../lib/contact';
import {
  categorySummary,
  cityHasProviders,
  countLabel,
  otherListedCities,
  resultsTitle,
  searchProviders,
  shortCity,
} from '../lib/search';
import { filtersFromParams, paramsFromFilters } from '../lib/urls';
import type { Provider, SearchFilters } from '../types';
import { DEFAULT_CITY } from '../types';

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

  const clearAll = () =>
    apply({ q: '', categories: [], priceOnly: false });

  const openWhatsApp = (provider: Provider) => {
    if (!openExternal(whatsappUrl(provider))) {
      toast(`Abrindo WhatsApp de ${provider.name}`);
    }
  };

  /* Nobody serves the city at all — a different answer from "nobody matches
     these filters", and the only one that is true when the city was typed
     into the search rather than picked from the catalogue. */
  const cityIsEmpty = !cityHasProviders(catalog, filters.city);
  const elsewhere = cityIsEmpty ? otherListedCities(CITIES, filters.city) : [];

  const narrowed =
    filters.q !== '' || filters.categories.length > 0 || filters.priceOnly;

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
            summary={categorySummary(filters.categories)}
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

          <CitySearch
            label="Cidade"
            value={filters.city}
            active={filters.city !== DEFAULT_CITY}
            onChange={(city) => apply({ city })}
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
      ) : cityIsEmpty ? (
        <div className="sp-empty">
          <h2 className="sp-empty__title">
            Ainda não há prestadores em {shortCity(filters.city)}
          </h2>
          <p className="sp-empty__text">
            Ninguém cadastrou serviços nessa cidade até agora. Assim que
            alguém se cadastrar, aparece aqui.
          </p>
          {elsewhere.length > 0 && (
            <>
              <p className="sp-empty__label">Cidades com prestadores</p>
              <div className="sp-empty__cities">
                {elsewhere.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="sp-chip"
                    onClick={() => apply({ city })}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="sp-empty__actions">
            <Link
              className="sp-btn sp-btn--primary sp-btn--md"
              to="/cadastrar"
              state={{ city: filters.city }}
            >
              Atendo nessa cidade
            </Link>
          </div>
        </div>
      ) : (
        <div className="sp-empty">
          <h2 className="sp-empty__title">Nenhum profissional encontrado</h2>
          <p className="sp-empty__text">
            Ninguém em {shortCity(filters.city)} atende essa combinação.
            Tente com menos filtros.
          </p>
          <div className="sp-empty__actions">
            {narrowed && (
              <button
                type="button"
                className="sp-btn sp-btn--primary sp-btn--md"
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
