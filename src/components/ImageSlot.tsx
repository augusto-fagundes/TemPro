import { useEffect, useRef, useState } from 'react';

interface ImageSlotProps {
  /** Published image. When absent the slot shows its placeholder label. */
  src?: string;
  /** Label shown while the slot is empty; also the alt text once filled. */
  placeholder: string;
  radius?: number;
  className?: string;
  /** Let the viewer attach an image — used by the provider's upload grids. */
  editable?: boolean;
  onPick?: (file: File) => void;
}

/**
 * Fixed-shape image well. Read-only by default (catalogue photos), or a
 * one-click picker when the provider is filling in their own gallery.
 *
 * A picked file is previewed from an object URL and revoked when it is
 * replaced or the slot unmounts; `onPick` hands the raw File to the caller
 * for upload.
 */
export function ImageSlot({
  src,
  placeholder,
  radius = 14,
  className,
  editable = false,
  onPick,
}: ImageSlotProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = failed ? undefined : (preview ?? src);

  const body = shown ? (
    <img
      className="sp-slot__img"
      src={shown}
      alt={placeholder}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="sp-slot__ph">{placeholder}</span>
  );

  const style = { borderRadius: radius };
  // A filled slot drops the dashed "drop something here" treatment.
  const classes = ['sp-slot', shown && 'sp-slot--filled', className]
    .filter(Boolean)
    .join(' ');

  if (!editable) {
    return (
      <div className={classes} style={style}>
        {body}
      </div>
    );
  }

  const pick = (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onPick?.(file);
  };

  return (
    <>
      <button
        type="button"
        className={`${classes} sp-slot--editable`}
        style={style}
        onClick={() => input.current?.click()}
        aria-label={shown ? `Trocar imagem: ${placeholder}` : placeholder}
      >
        {body}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </>
  );
}
