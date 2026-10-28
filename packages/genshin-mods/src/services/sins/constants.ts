// The five levels every question grades on, from none to extreme, so the sins are comparable with one another
export const SIN_CRITERIA = [
  "Absent: the prompt shows none of it",
  "Slight: a trace of it in passing",
  "Moderate: it shapes part of the prompt",
  "Strong: it shapes most of the prompt",
  "Extreme: it is the whole prompt",
] as const;

// The top level the score reads, so a score divides by it to lie between none and extreme
export const SIN_TOP_LEVEL: number = SIN_CRITERIA.length - 1;

// The half-life in prompts: a sin's score moves about halfway toward a new pattern within this many prompts
export const SIN_HALF_LIFE_PROMPTS = 30;

// Applied to the old counts on each prompt, so each count halves every half-life
export const SIN_DISCOUNT: number = 2 ** (-1 / SIN_HALF_LIFE_PROMPTS);

// One pseudo-count of each outcome, so a sin with no evidence reads as an even half
export const SIN_PRIOR = 1;

// The evidence kept per sin: past this the discount has taken the rest, under a tenth of a percent
export const SIN_HISTORY_LENGTH = 300;

// The bar's width in cells, the solid run to the score and the tinted run to the score plus its spread
export const SIN_BAR_WIDTH = 24;

export const SINS_PANE_ID = "sins";

// The node script's whole run, its one request included; a run past this is killed and reads as failed
export const SINS_TIMEOUT_MS = 60_000;

export const SINS_API_URL = "https://api.typesafe.ai/v1/systemone";
