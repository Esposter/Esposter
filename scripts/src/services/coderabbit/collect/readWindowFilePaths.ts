import { readPathFilters } from "#src/services/coderabbit/collect/readPathFilters";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { matchesGlob } from "node:path";

// The files the bot's review counts: the diff against the window's base — `main`'s tip for a window cut from the bottom,
// The head of the window below otherwise — kept to the paths the base's own `.coderabbit.yaml` path filters include, when
// It lists any, and less every path they exclude, since the bot reads its config from the base and states its count after
// Them. Three dots count only the head's side of that merge base, so a fold of `main` into a window on `main` adds
// Nothing, while a window stacked on another counts what `main` brought, as the bot does
// (docs: infra/review-collector/collection-cycle, "Port")
export const readWindowFilePaths = (baseSha: string, cwd?: string, headRef = "HEAD"): string[] => {
  const pathFilters = readPathFilters(
    getResult(() => runGit(["show", `${baseSha}:.coderabbit.yaml`], cwd)).unwrapOr(""),
  );
  const excludedGlobs = pathFilters
    .filter((pathFilter) => pathFilter.startsWith("!"))
    .map((pathFilter) => pathFilter.slice(1));
  const includedGlobs = pathFilters.filter((pathFilter) => !pathFilter.startsWith("!"));
  return getNonEmptyLines(runGit(["diff", "--name-only", `${baseSha}...${headRef}`], cwd)).filter(
    (path) =>
      (includedGlobs.length === 0 || includedGlobs.some((glob) => matchesGlob(path, glob))) &&
      !excludedGlobs.some((glob) => matchesGlob(path, glob)),
  );
};
