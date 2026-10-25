const NUMBER_REGEX = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu;

export const parseScalar = (text: string): unknown => {
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'");
  else if (text.startsWith('"') && text.endsWith('"')) return text.slice(1, -1);
  else if (NUMBER_REGEX.test(text)) return Number(text);
  else if (["false", "true"].includes(text)) return text === "true";
  else return text;
};
