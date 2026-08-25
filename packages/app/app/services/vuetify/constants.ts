import { dayjs } from "#shared/services/dayjs";

export const THEME_COOKIE_NAME = "theme";
// Written with an explicit lifetime, because a cookie with none is a session cookie — and an installed PWA ends
// Its session whenever the OS evicts the standalone window, which it does routinely. The chosen theme then
// Vanished and the app fell back to the system preference, so the setting looked like it reset at random.
// Shared by the reader and the writer: the options given at each `useCookie` call are what serialise the write,
// So a lifetime on one call site alone is a lifetime the other silently drops
export const THEME_COOKIE_OPTIONS = { maxAge: dayjs.duration(1, "year").asSeconds() };
export const DISABLED_OPACITY = 0.38;
