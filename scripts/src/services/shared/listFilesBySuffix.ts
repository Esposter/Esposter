import { compareText } from "@esposter/shared";
import { readdirSync } from "node:fs";

// The names of the files in the directory that end in the suffix, in code unit order, so a rerun lists them in the
// Same order
export const listFilesBySuffix = (directory: string, suffix: string): string[] =>
  readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .toSorted(compareText);
