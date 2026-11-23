import { addWords } from "#src/services/sweeps/staleNames/addWords";

// Every word of a source text, as an array so a cache can hold it
export const readFileWords = (code: string): string[] => {
  const words = new Set<string>();
  addWords(words, code);
  return [...words];
};
