import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { readFileSync } from "node:fs";

// Every word of a file, as an array so a cache can hold it
export const readFileWords = (absolutePath: string): string[] => {
  const words = new Set<string>();
  addWords(words, readFileSync(absolutePath, "utf8"));
  return [...words];
};
