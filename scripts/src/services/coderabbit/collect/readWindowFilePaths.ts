import { readPathFilters } from "#src/services/coderabbit/collect/readPathFilters";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { matchesGlob } from "node:path";

// The files the bot's review counts: the diff against the window's base — `main`'s tip for a window cut from the bottom,
// The head of the window below otherwise — less every path the base's own `.coderabbit.yaml` path filters exclude, since
// The bot reads its config from the base and states its count after them. Three dots count only the head's side of
// That merge base, so a fold of `main` into a window on `main` adds nothing, while a window stacked on another counts
// What `main` brought, as the bot does (docs: infra/review-collector/collection-cycle, "Port")
export const readWindowFilePaths = (baseSha: string, cwd?: string, headRef = "HEAD"): string[] => {
  const excludedGlobs = readPathFilters(
    getResult(() => runGit(["show", `${baseSha}:.coderabbit.yaml`], cwd)).unwrapOr(""),
  )
    .filter((pathFilter) => pathFilter.startsWith("!"))
    .map((pathFilter) => pathFilter.slice(1));
  return getNonEmptyLines(runGit(["diff", "--name-only", `${baseSha}...${headRef}`], cwd)).filter(
    (path) => !excludedGlobs.some((glob) => matchesGlob(path, glob)),
  );
};
