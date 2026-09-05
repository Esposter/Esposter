export const THEME_COOKIE_NAME = "theme";
// Written with an explicit lifetime, because a cookie with none is a session cookie — and an installed PWA ends
// Its session whenever the OS evicts the standalone window, which it does routinely. The chosen theme then
// Vanishes and the app falls back to the system preference, so the setting reads as having reset at random.
// Shared by the reader and the writer: the options given at each `useCookie` call are what serialise the write,
// So a lifetime on one call site alone is a lifetime the other silently drops
export const THEME_COOKIE_OPTIONS = { maxAge: Temporal.Duration.from({ days: 365 }).total("seconds") };
export const DISABLED_OPACITY = 0.38;
// Vuetify's "never auto-dismiss" sentinel. A snackbar reporting standing state — an error waiting to be read,
// A list scrolled away from the present — takes it, because a timeout would retract the message while what it
// Reports is still true, and a one-way `:model-value` binding cannot bring it back until the value flips
export const SNACKBAR_PERSISTENT_TIMEOUT = -1;
