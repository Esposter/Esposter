import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const TSCONFIG_REGEX = /^tsconfig.*\.json$/u;

// Every tsconfig sitting beside the given directories, deduplicated because the package being built is this one
// Whenever this package builds itself, and sorted because a hash over their contents has to mean the same thing
// However `readdirSync` happens to order them.
//
// The whole directory rather than the `extends` chain resolved by hand. The chain is four deep, reaches presets a
// Package never names, and settling it properly means reimplementing tsconfig resolution to save reading a handful
// Of small files once per build. The two failure directions are not symmetric: hashing a file the barrel does not
// Depend on costs one regeneration, while missing one serves a barrel that does not match the source it claims to
// Be generated from — so the whole directory is the cheap side of that trade.
export const getTsconfigPaths = (...directories: string[]): string[] =>
  [
    ...new Set(
      directories.flatMap((directory) =>
        readdirSync(directory)
          .filter((entry) => TSCONFIG_REGEX.test(entry))
          .map((entry) => resolve(directory, entry)),
      ),
    ),
  ].toSorted();
