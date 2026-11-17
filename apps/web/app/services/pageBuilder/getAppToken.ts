import { normalizeString } from "@esposter/shared";

// One of the library's tokens as the app's own document resolves it, since the canvas frame holds none of the app's tokens
export const getAppToken = (name: string): string =>
  normalizeString(getComputedStyle(window.document.documentElement).getPropertyValue(name));
