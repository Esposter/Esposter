// A pack's terms are fetched on its own, and abandoned past this so a stalled request cannot hold the page's text back
export const CHARACTER_TERMS_FETCH_TIMEOUT_MS = 10_000;
