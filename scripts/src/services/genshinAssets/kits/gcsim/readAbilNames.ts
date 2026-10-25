import { toCamelCase } from "#src/services/genshinAssets/kits/gcsim/toCamelCase";

// The names an attack's `Abil` gives it, its text before its parenthesis and the parenthesis' own text: `Boundless
// Origin` and `C6` in `Boundless Origin (C6)`
export const readAbilNames = (abil: string): string[] => {
  const [base = "", parenthesis = ""] = abil.split("(");
  return [base, parenthesis.replace(")", "")].map((text) => toCamelCase(text)).filter((name) => name !== "");
};
