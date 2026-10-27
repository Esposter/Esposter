// The seven sins, in the order the pane draws them. Each is one `score` question Jev answers about a prompt, and one
// Fixed slot of the dataviz reference palette, so a sin keeps its colour as its score moves
export const SIN_NAMES = ["pride", "greed", "wrath", "envy", "lust", "gluttony", "sloth"] as const;

export type SinName = (typeof SIN_NAMES)[number];

export const SinQuestionMap: Record<SinName, string> = {
  envy: 'How far does the prompt measure against another tool, person or project, as in "the other tool", "like theirs" or "why doesn\'t ours do what X does"?',
  gluttony: "How heavy is the prompt, as in a large pasted share of text or a whole file or log pasted in?",
  greed:
    'How far does the prompt ask for more than one request holds, as in "and also", "while you\'re at it", "everything" or several tasks at once?',
  lust: 'How far does the prompt crave the new over the finished, as in "rewrite", "from scratch", "redesign" or "a new approach"?',
  pride:
    'How far does the prompt assert certainty and wave off checks, as in "obviously", "definitely", "no need to test" or "trust me"?',
  sloth:
    'How far is effort handed off without a steer, as in "idk", "whatever", "you decide", "figure it out" or a one-word prompt?',
  wrath:
    'How heated is the prompt\'s register, as in runs of punctuation, words in capitals, "again", "still broken" or "why won\'t"?',
};

// The five levels every question grades on, from none to extreme, so the sins are comparable with one another
export const SIN_CRITERIA = [
  "Absent: the prompt shows none of it",
  "Slight: a trace of it in passing",
  "Moderate: it shapes part of the prompt",
  "Strong: it shapes most of the prompt",
  "Extreme: it is the whole prompt",
];

// The top level the score reads, so a score divides by it to lie between none and extreme
export const SIN_TOP_LEVEL = SIN_CRITERIA.length - 1;

// The half-life in prompts: a sin's score moves about halfway toward a new pattern within this many prompts
export const SIN_HALF_LIFE_PROMPTS = 30;

// Applied to the old counts on each prompt, so each count halves every half-life
export const SIN_DISCOUNT = 2 ** (-1 / SIN_HALF_LIFE_PROMPTS);

// One pseudo-count of each outcome, so a sin with no evidence reads as an even half
export const SIN_PRIOR = 1;

// The evidence kept per sin: past this the discount has taken the rest, under a tenth of a percent
export const SIN_HISTORY_LENGTH = 300;

// The trend is the score over the half-life's own window
export const SIN_TREND_LENGTH = SIN_HALF_LIFE_PROMPTS;

// The bar's width in cells, the solid run to the score and the tinted run to the score plus its spread
export const SIN_BAR_WIDTH = 24;

export const SinColorMap: Record<SinName, { dark: string; light: string }> = {
  envy: { dark: "#c98500", light: "#eda100" },
  gluttony: { dark: "#008300", light: "#008300" },
  greed: { dark: "#d95926", light: "#eb6834" },
  lust: { dark: "#d55181", light: "#e87ba4" },
  pride: { dark: "#3987e5", light: "#2a78d6" },
  sloth: { dark: "#9085e9", light: "#6250d6" },
  wrath: { dark: "#199e70", light: "#1baf7a" },
};

export const SINS_PANE_ID = "sins";

// The node script's whole run, its one request included; a run past this is killed and reads as failed
export const SINS_TIMEOUT_MS = 60_000;

export const SINS_API_URL = "https://api.typesafe.ai/v1/systemone";
