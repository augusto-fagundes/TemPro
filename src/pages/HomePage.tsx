import { Fragment, useLayoutEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CategoryIcon } from "../components/CategoryIcon";
import { ProviderCard } from "../components/ProviderCard";
import { useCatalog } from "../context/ProfileProvider";
import { useMeta } from "../context/CatalogProvider";
import { useToast } from "../context/ToastProvider";
import { openExternal, whatsappUrl } from "../lib/contact";
import { countInCategory, countLabel } from "../lib/search";
import { searchPath } from "../lib/urls";
import type { Provider } from "../types";
import { DEFAULT_CITY } from "../types";

const HERO_WORDS = ["Encontre", "quem", "resolve."];

/** One full row of the category grid (4 across on desktop, 2 on mobile). */
const HOME_CATEGORIES = 4;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY);
  const navigate = useNavigate();
  const toast = useToast();
  const catalog = useCatalog();
  const { cities: CITIES, featuredCategories } = useMeta();
  const featured = catalog.slice(0, 3);
  /* The API ranks the featured categories; how many fit is a layout call, and
     the grid is 4 across on desktop — so one full row. */
  const homeCategories = featuredCategories.slice(0, HOME_CATEGORIES);

  /* The hero animates in by transitioning OUT of a hidden class, never by
     holding a hidden keyframe: if the browser skips the transition (throttled
     tab, reduced motion, an old engine) the properties just jump to their
     settled values and the headline is readable. The timeout is the floor —
     rAF alone can be starved in a background tab, and a hero that never
     appears is far worse than one that appears without animating. */
  const [entered, setEntered] = useState(false);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    const fallback = window.setTimeout(() => setEntered(true), 400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, []);

  const openWhatsApp = (provider: Provider) => {
    if (!openExternal(whatsappUrl(provider))) {
      toast(`Abrindo WhatsApp de ${provider.name}`);
    }
  };

  return (
    <>
      <section className={`sp-hero${entered ? " sp-hero--entered" : ""}`}>
        <div className="sp-container sp-hero__inner">
          {/* Split so each word can rise on its own; the spaces between the
              spans are real text, so the headline still reads as one phrase
              to a screen reader. */}
          <h1 className="sp-hero__title">
            {HERO_WORDS.map((word, i) => (
              <Fragment key={word}>
                {i > 0 && " "}
                <span
                  className="sp-hero__word"
                  style={{ "--i": i } as CSSProperties}
                >
                  <span className="sp-hero__word-in">{word}</span>
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="sp-hero__sub">
            Profissionais e serviços perto de você, em poucos cliques.
          </p>

          <form
            className="sp-searchbar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(searchPath({ q: query, city }));
            }}
          >
            <input
              className="sp-input sp-searchbar__q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qual serviço você procura?"
              aria-label="Qual serviço você procura?"
            />
            <select
              className="sp-select sp-searchbar__city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="Cidade"
            >
              {CITIES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <button
              type="submit"
              className="sp-btn sp-btn--primary sp-btn--lg sp-searchbar__go"
            >
              Buscar
            </button>
          </form>

          <p className="sp-hero__hint">
            Tente buscar pelo nome, categoria ou cidade.
          </p>
        </div>
      </section>

      <section className="sp-container sp-block">
        <div className="sp-block__head">
          <h2 className="sp-block__title">Categorias populares</h2>
          {/* <Link className="sp-block__more" to={searchPath({ city })}>
            Ver todos os profissionais →
          </Link> */}
        </div>

        <div className="sp-catgrid">
          {homeCategories.map((name) => {
            const total = countInCategory(catalog, name, city);
            return (
              <Link
                key={name}
                className="sp-cat"
                to={searchPath({ categories: [name], city })}
              >
                <span className="sp-cat__icon">
                  <CategoryIcon category={name} />
                </span>
                <span className="sp-cat__name">{name}</span>
                <span className="sp-cat__count">
                  {countLabel(total, "profissional", "profissionais")}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="sp-container sp-block">
        <div className="sp-block__head">
          <h2 className="sp-block__title">Profissionais em destaque</h2>
          <Link className="sp-block__more" to={searchPath({ city })}>
            Ver todos →
          </Link>
        </div>
        <div className="sp-grid">
          {featured.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onWhatsApp={openWhatsApp}
            />
          ))}
        </div>
      </section>

      <section className="sp-container sp-block">
        <div className="sp-cta">
          <div className="sp-cta__body">
            <h2 className="sp-cta__title">Você presta serviços?</h2>
            <p className="sp-cta__text">
              Publique seus serviços e apareça para quem já está procurando na
              sua cidade. É gratuito.
            </p>
          </div>
          <Link
            className="sp-btn sp-btn--primary sp-btn--lg sp-btn--shine"
            to="/painel"
          >
            Cadastrar meus serviços
          </Link>
        </div>
      </section>
    </>
  );
}
