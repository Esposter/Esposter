import type { PathFilterGlobs } from "#src/models/coderabbit/collect/PathFilterGlobs";

import { readPathFilters } from "#src/services/coderabbit/collect/readPathFilters";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The globs the base's own `.coderabbit.yaml` path filters keep the bot's review to and leave out of it. The bot reads
// Its config from the base and states its file count after these, so every count of ours, and the reshaper's prompt, does too
export const readPathFilterGlobs = (baseSha: string, cwd?: string): PathFilterGlobs => {
  const pathFilters = readPathFilters(
    getResult(() => runGit(["show", `${baseSha}:.coderabbit.yaml`], cwd)).unwrapOr(""),
  );
  return {
    excludedGlobs: pathFilters
      .filter((pathFilter) => pathFilter.startsWith("!"))
      .map((pathFilter) => pathFilter.slice(1)),
    includedGlobs: pathFilters.filter((pathFilter) => !pathFilter.startsWith("!")),
  };
};
