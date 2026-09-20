const NON_ALPHANUMERIC_RUN_REGEX = /[^a-z0-9]+/gu;
const EDGE_HYPHEN_REGEX = /^-|-$/gu;

// "Hu Tao" → "hu-tao": the file name a character's voice card is kept under
export const getCardSlug = (name: string): string =>
  name.toLowerCase().replace(NON_ALPHANUMERIC_RUN_REGEX, "-").replace(EDGE_HYPHEN_REGEX, "");
