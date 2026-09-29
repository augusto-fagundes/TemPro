import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { CategoryIcon } from "../components/CategoryIcon";
import { CitySearch } from "../components/CitySearch";
import { useCatalog } from "../context/ProfileProvider";
import { useMeta } from "../context/CatalogProvider";
import { useToast } from "../context/ToastProvider";
import { countInCategory } from "../lib/search";
import { searchPath } from "../lib/urls";
import { DEFAULT_CITY } from "../types";

/* Two fixed lines, not a wrap: "Encontre quem / resolve." is the shape the
   headline is meant to have, and letting it reflow would give a different
   one at every width. Each word still animates on its own, so the index the
   stagger reads off is counted across both lines. */
const HERO_LINES = [["Encontre", "quem"], ["resolve."]];

/** How long the headline count takes to reach its target, in ms. */
const COUNT_UP_MS = 2200;

/* The two invites under the categories: provider sign-up and referral. */
const CTA_SLIDES = 2;
const CTA_INTERVAL_MS = 3000;

/**
 * True once the element has been on screen, and true from then on. The count
 * is the whole point of the card, so it has to be watched rather than missed
 * while the page loads further up; once it has played there is nothing to
 * replay, hence the one-way flag. A browser with no `IntersectionObserver`
 * gets the animation right away instead of never.
 */
function useSeenOnScreen(ref: RefObject<Element | null>): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      /* Enough of the card in view that the number itself is readable — a
         single pixel at the edge would spend the count off screen. */
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, seen]);

  return seen;
}

/**
 * Counts from zero up to `target`, starting when `start` turns true. The
 * number arriving is what makes this card read as momentum rather than as a
 * static figure — but it is still only decoration on a fact, so anyone who
 * asked for reduced motion gets the final number immediately, and so does
 * anyone whose browser has no `matchMedia`.
 */
function useCountUp(target: number, start: boolean): number {
  const [value, setValue] = useState(0);

  useLayoutEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || target <= 0) {
      setValue(target);
      return;
    }
    if (!start) {
      setValue(0);
      return;
    }

    /* The clock starts on the first frame delivered, not on the effect: in a
       throttled or background tab those can be far apart, and timing from the
       effect would make the count jump most of the way on frame one. */
    let from: number | null = null;
    let frame = 0;

    const step = (now: number) => {
      from ??= now;
      const t = Math.min((now - from) / COUNT_UP_MS, 1);
      /* easeOutExpo, softened: the figure still lands early enough to be read
         as a number rather than a spinner, but the climb stays visible for
         most of the duration instead of snapping on the first frames. */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -6 * t);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    setValue(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  return value;
}

/** Two rows of the category grid (3 across on desktop, 2 on mobile). */
const HOME_CATEGORIES = 6;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY);
  const navigate = useNavigate();
  const toast = useToast();
  const catalog = useCatalog();
  const { categories: ALL_CATEGORIES } = useMeta();
  const providerCount = catalog.length;
  const countCard = useRef<HTMLDivElement>(null);
  const shownCount = useCountUp(providerCount, useSeenOnScreen(countCard));

  /* Ranked by who is actually available in the chosen city, not by the API's
     editorial order: a category with nobody behind it is a dead end, so it is
     dropped rather than shown empty. Recomputed per city, which is why
     changing the city reshuffles the grid. */
  const rankedCategories = useMemo(() => {
    return ALL_CATEGORIES.map((name) => ({
      name,
      total: countInCategory(catalog, name, city),
    }))
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pt-BR"));
  }, [ALL_CATEGORIES, catalog, city]);

  const homeCategories = rankedCategories.slice(0, HOME_CATEGORIES);
  const hasMoreCategories = rankedCategories.length > HOME_CATEGORIES;

  /* The hero animates in by transitioning OUT of a hidden class, never by
     holding a hidden keyframe: if the browser skips the transition (throttled
     tab, reduced motion, an old engine) the properties just jump to their
     settled values and the headline is readable. The timeout is the floor —
     rAF alone can be starved in a background tab, and a hero that never
     appears is far worse than one that appears without animating. */
  const [entered, setEntered] = useState(false);
  const [ctaIndex, setCtaIndex] = useState(0);
  const ctaStartX = useRef<number | null>(null);
  const [ctaPaused, setCtaPaused] = useState(false);
  /* Advances on its own, but the clock restarts on every change — a swipe or a
     dot click gets its full 3s before the next slide — and it holds still while
     the pointer or focus is on it, so a card never slides out from under a
     click. Reduced motion opts out entirely: without the slide the swap would
     be an unannounced jump. */
  useEffect(() => {
    if (ctaPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setCtaIndex((index) => (index + 1) % CTA_SLIDES),
      CTA_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [ctaIndex, ctaPaused]);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    const fallback = window.setTimeout(() => setEntered(true), 400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <section className={`sp-hero${entered ? " sp-hero--entered" : ""}`}>
        <div className="sp-container sp-hero__inner">
          <h1 className="sp-hero__title">
            {HERO_LINES.map((words, line) => (
              <span className="sp-hero__line" key={line}>
                {words.map((word, i) => (
                  <Fragment key={word}>
                    {i > 0 && " "}
                    <span
                      className="sp-hero__word"
                      style={
                        {
                          "--i": line === 0 ? i : HERO_LINES[0].length + i,
                        } as CSSProperties
                      }
                    >
                      <span className="sp-hero__word-in">{word}</span>
                    </span>
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>
          <p className="sp-hero__sub">
            Profissionais perto de você, em poucos cliques.
          </p>

          <form
            className="sp-searchbar"
            role="search"
            /* Submitting with nothing typed is not an error to block — it is
               "show me everyone here", which the results page answers. The
               button stays solid rather than greying out the one action the
               screen exists for. */
            onSubmit={(e) => {
              e.preventDefault();
              navigate(searchPath({ q: query, city }));
            }}
          >
            {/* A real label, kept off-screen: the placeholder names the field
                while it is empty, and stops naming it the moment you type. */}
            <label className="sp-sronly" htmlFor="home-q">
              Qual serviço você procura?
            </label>
            <div className="sp-searchfield">
              <input
                id="home-q"
                className="sp-searchfield__input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qual serviço você procura?"
                autoComplete="off"
              />
              <button
                type="submit"
                className="sp-searchfield__go"
                aria-label="Buscar"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </button>
            </div>

            {/* The city is a correction to a search, not a second search box:
                bare text with an outline pin, against the filled square that
                runs the query. */}
            <CitySearch variant="plain" value={city} onChange={setCity} />
          </form>
        </div>
      </section>

      {homeCategories.length > 0 && (
        <section className="sp-container sp-block sp-block--tight">
          {/* A second way in, not a second headline: the search field is the
              offer on this screen, so this steps down to a label. */}
          <h2 className="sp-eyebrow">Ou escolha uma categoria</h2>

          <div className="sp-catgrid">
            {homeCategories.map(({ name }) => (
              <Link
                key={name}
                className="sp-cat"
                to={searchPath({ categories: [name], city })}
              >
                <span className="sp-cat__icon">
                  <CategoryIcon category={name} />
                </span>
                <span className="sp-cat__name">{name}</span>
              </Link>
            ))}

            {hasMoreCategories && (
              /* The results page is where every category is browsable, so
                 that is where this goes — there is no separate index. */
              <Link className="sp-catgrid__more" to={searchPath({ city })}>
                Ver todas as categorias
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="sp-container sp-block">
        <div
          ref={countCard}
          className="sp-countcard"
          /* Reserves the numeral's width up front so the count-up does not
             shove the sentence sideways when it crosses 9, 99, 999. */
          style={{ '--sp-count-ch': `${String(providerCount).length}ch` } as CSSProperties}
        >
          {providerCount > 0 ? (
            <>
              {/* One sentence, in DOM reading order, so a screen reader gets
                  "Já são 30 profissionais cadastrados" — the grid only moves
                  the numeral into its own column. The label pins the final
                  count, since the visible one is still counting up. */}
              <h2
                className="sp-countcard__title"
                aria-label={`Já ${providerCount === 1 ? 'é' : 'são'} ${providerCount} ${
                  providerCount === 1
                    ? 'profissional cadastrado'
                    : 'profissionais cadastrados'
                } no TemPro`}
              >
                <span className="sp-countcard__lead" aria-hidden="true">
                  Já {providerCount === 1 ? 'é' : 'são'}
                </span>
                <span className="sp-countcard__num" aria-hidden="true">
                  {shownCount}
                </span>
                <span className="sp-countcard__unit" aria-hidden="true">
                  {providerCount === 1
                    ? 'profissional cadastrado'
                    : 'profissionais cadastrados'}
                </span>
              </h2>
            </>
          ) : (
            /* The catalogue is loaded before this page renders, so an empty
               one is a real empty region, not a loading frame. "Já são 0"
               would be a worse thing to say than nothing. */
            <>
              <h2 className="sp-countcard__title sp-countcard__title--empty">
                Seja o primeiro da sua região
              </h2>
              <p className="sp-countcard__text">
                O TemPro está começando por aqui — seu serviço pode ser o
                primeiro da lista.
              </p>
            </>
          )}
        </div>
      </section>

      <section className="sp-container sp-block">
        <div
          className="sp-cta-carousel"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setCtaPaused(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setCtaPaused(false);
          }}
          onFocus={() => setCtaPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setCtaPaused(false);
            }
          }}
        >
          <div
            className="sp-cta-carousel__frame"
            onPointerDown={(event) => {
              ctaStartX.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (ctaStartX.current == null) return;
              const delta = event.clientX - ctaStartX.current;
              ctaStartX.current = null;
              if (delta < -48) setCtaIndex(1);
              else if (delta > 48) setCtaIndex(0);
            }}
          >
            <div
              className="sp-cta-carousel__track"
              style={{ transform: `translateX(-${ctaIndex * 100}%)` }}
            >
              <div className="sp-cta-carousel__slide">
                <div className="sp-cta">
                  <span className="sp-cta__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M3 12h18M12 11v2" />
                    </svg>
                  </span>
                  <div className="sp-cta__body">
                    <h2 className="sp-cta__title">Você presta serviços?</h2>
                    <p className="sp-cta__text">
                      Publique seus serviços e apareça para quem já está
                      procurando na sua cidade. É gratuito.
                    </p>
                  </div>
                  <Link
                    className="sp-btn sp-btn--primary sp-btn--lg sp-btn--shine sp-cta__action"
                    to="/painel"
                  >
                    Cadastrar meus serviços
                    <CtaArrow />
                  </Link>
                </div>
              </div>

              <div className="sp-cta-carousel__slide">
                <div className="sp-cta sp-cta--invite">
                  <span className="sp-cta__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="8" r="3.5" />
                      <path d="M3 20a6 6 0 0 1 12 0" />
                      <path d="M19 8v6M16 11h6" />
                    </svg>
                  </span>
                  <div className="sp-cta__body">
                    <h2 className="sp-cta__title">Conhece algum prestador?</h2>
                    <p className="sp-cta__text">
                      Indique para que ele se cadastre no TemPro!
                    </p>
                  </div>
                  <button
                    type="button"
                    className="sp-btn sp-btn--primary sp-btn--lg sp-cta__action"
                    onClick={async () => {
                      const url = `${window.location.origin}/cadastrar`;
                      try {
                        await navigator.clipboard.writeText(url);
                        toast("Link de cadastro copiado");
                      } catch {
                        toast("Não foi possível copiar o link");
                      }
                    }}
                  >
                    Indicar prestador
                    <CtaArrow />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="sp-cta-carousel__dots"
            role="tablist"
            aria-label="Convites"
          >
            <button
              type="button"
              role="tab"
              aria-selected={ctaIndex === 0}
              aria-label="Você presta serviços?"
              className={`sp-cta-carousel__dot${ctaIndex === 0 ? " sp-cta-carousel__dot--on" : ""}`}
              onClick={() => setCtaIndex(0)}
            />
            <button
              type="button"
              role="tab"
              aria-selected={ctaIndex === 1}
              aria-label="Conhece algum prestador?"
              className={`sp-cta-carousel__dot${ctaIndex === 1 ? " sp-cta-carousel__dot--on" : ""}`}
              onClick={() => setCtaIndex(1)}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function CtaArrow() {
  return (
    <svg
      className="sp-cta__arrow"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
