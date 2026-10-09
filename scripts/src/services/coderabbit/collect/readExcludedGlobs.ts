import { readPathFilters } from "#src/services/coderabbit/collect/readPathFilters";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The globs the base's own `.coderabbit.yaml` leaves out of the bot's review — each `!` path filter, its `!` dropped.
// The bot reads its config from the base and states its file count after these, so every count of ours does too
export const readExcludedGlobs = (baseSha: string, cwd?: string): string[] =>
  readPathFilters(getResult(() => runGit(["show", `${baseSha}:.coderabbit.yaml`], cwd)).unwrapOr(""))
    .filter((pathFilter) => pathFilter.startsWith("!"))
    .map((pathFilter) => pathFilter.slice(1));
