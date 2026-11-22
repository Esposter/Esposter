import { VeilPatternMap } from "./VeilPatternMap";

export const veilText = (text: string): string => {
  let veiled = text;
  for (const [placeholder, pattern] of VeilPatternMap) veiled = veiled.replaceAll(pattern, placeholder);
  return veiled;
};
