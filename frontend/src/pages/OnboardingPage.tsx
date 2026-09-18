import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { markGuestOnboarded } from '../lib/guest';

const SLIDES = [
  {
    title: 'Encontre prestadores',
    text: 'A lista de profissionais que atendem na sua cidade, organizada por serviço.',
    icon: (
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      </svg>
    ),
  },
  {
    title: 'Busque pelo que precisa',
    text: 'Filtre por serviço, cidade ou nome do profissional.',
    icon: (
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    title: 'Fale direto com ele',
    text: 'No perfil você vê o que o prestador faz, onde atende e como entrar em contato.',
    icon: (
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </svg>
    ),
  },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from.startsWith('/')
      ? (location.state as { from: string }).from
      : '/';

  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const last = index === SLIDES.length - 1;

  const finish = useCallback(() => {
    markGuestOnboarded();
    navigate(from === '/bem-vindo' || from === '/onboarding' ? '/' : from, {
      replace: true,
    });
  }, [from, navigate]);

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (last) finish();
        else go(index + 1);
      }
      if (event.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, go, index, last]);

  return (
    <div className="sp-onboard">
      <div
        className="sp-onboard__frame"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current == null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (delta < -48) {
            if (last) finish();
            else go(index + 1);
          } else if (delta > 48) {
            go(index - 1);
          }
        }}
      >
        <div
          className="sp-onboard__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <section className="sp-onboard__slide" key={slide.title}>
              <div className="sp-onboard__art" aria-hidden="true">
                {slide.icon}
              </div>
              <h1 className="sp-onboard__title">{slide.title}</h1>
              <p className="sp-onboard__text">{slide.text}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="sp-onboard__dots" role="tablist" aria-label="Passos">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`sp-onboard__dot${i === index ? ' sp-onboard__dot--on' : ''}`}
            onClick={() => go(i)}
          >
            <span className="sp-sr">{slide.title}</span>
          </button>
        ))}
      </div>

      <div className="sp-onboard__nav">
        {index > 0 ? (
          <button
            type="button"
            className="sp-btn sp-btn--outline sp-btn--lg"
            onClick={() => go(index - 1)}
          >
            Voltar
          </button>
        ) : (
          <Link className="sp-btn sp-btn--outline sp-btn--lg" to="/bem-vindo">
            Voltar
          </Link>
        )}
        <button
          type="button"
          className="sp-btn sp-btn--primary sp-btn--lg"
          onClick={() => {
            if (last) finish();
            else go(index + 1);
          }}
        >
          {last ? 'Ver prestadores' : 'Próximo'}
        </button>
      </div>

      <button type="button" className="sp-onboard__skip" onClick={finish}>
        Pular
      </button>
    </div>
  );
}
