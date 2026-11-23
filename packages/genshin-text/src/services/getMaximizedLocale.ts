import { getResult } from "@esposter/shared";

export const getMaximizedLocale = (tag: string): Intl.Locale | undefined =>
  // A tag Intl refuses names no locale, which reads as undefined
  getResult(() => new Intl.Locale(tag).maximize()).unwrapOr(undefined);
