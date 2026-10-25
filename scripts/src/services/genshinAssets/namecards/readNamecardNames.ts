import { PNG_EXTENSION } from "#src/services/genshinAssets/shared/constants";
import { existsSync, readdirSync } from "node:fs";
import { extname, parse } from "node:path";

// The names of the PNGs a folder holds, each by its file name without the extension
export const readNamecardNames = (directory: string): string[] =>
  existsSync(directory)
    ? readdirSync(directory)
        .filter((file) => extname(file) === PNG_EXTENSION)
        .map((file) => parse(file).name)
    : [];
