import { useState } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  /** Box size in px. */
  size?: number;
  radius?: number;
}

/** First letters of the first two words: "Hidro Sul Encanamentos" → "HS". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

const TINTS = 6;

/**
 * Stable tint per business, so a listing is not a wall of identical squares
 * and the same provider keeps its color across pages.
 */
function tintOf(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % TINTS;
}

/**
 * A provider's mark. Uses the uploaded logo when there is one and falls back
 * to tinted initials — including when the image fails to load, so a broken
 * URL degrades to a real-looking monogram instead of an empty box.
 */
export function Avatar({ name, src, size = 52, radius = 14 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`sp-avatar sp-avatar--${tintOf(name)}`}
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          className="sp-avatar__img"
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="sp-avatar__initials"
          style={{ fontSize: Math.round(size * 0.36) }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
