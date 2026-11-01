import { getResult } from "@esposter/shared";

export const getMaximizedLocale = (tag: string): Intl.Locale | undefined =>
  getResult(() => new Intl.Locale(tag).maximize()).unwrapOr(undefined);
