export const THEME_COOKIE_NAME = "theme";
// Written with an explicit lifetime, because a cookie with none is a session cookie — and an installed PWA ends
// Its session whenever the OS evicts the standalone window, which it does routinely. The chosen theme then
// Vanishes and the app falls back to the system preference, so the setting reads as having reset at random.
// Shared by the reader and the writer: the options given at each `useCookie` call are what serialise the write,
// So a lifetime on one call site alone is a lifetime the other silently drops
export const THEME_COOKIE_OPTIONS = { maxAge: Temporal.Duration.from({ days: 365 }).total("seconds") };
export const DISABLED_OPACITY = 0.38;
// The one Vuetify dialog leave transition takes, so a close that waits for it emits after the dialog is gone
export const DIALOG_TRANSITION_DURATION_MS = 300;
