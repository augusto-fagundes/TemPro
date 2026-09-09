/** Product switches. Lift to a settings API when there is one. */
export const APP_CONFIG = {
  /** Show published prices on cards, profiles and the panel. */
  showPrices: true,
  /** Show the "Trabalhos realizados" gallery on a provider profile. */
  showGallery: true,
} as const;

export type AppConfig = typeof APP_CONFIG;
