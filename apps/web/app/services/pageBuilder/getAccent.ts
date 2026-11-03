import { normalizeString } from "@esposter/shared";

// The library's accent as the app's own document resolves it, since the canvas frame holds none of the app's tokens
export const getAccent = (): string =>
  normalizeString(getComputedStyle(window.document.documentElement).getPropertyValue("--ui-accent"));
