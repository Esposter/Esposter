import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The files the bot's review counts: the diff against the window's base — `main`'s tip for a window cut from the bottom,
// the head of the window below otherwise. Three dots count only the head's side of that merge base, so a fold of `main`
// into a window on `main` adds nothing, while a window stacked on another counts what `main` brought, as the bot does
// (docs: infra/review-collector/collection-cycle, "Port")
export const readWindowFilePaths = (baseSha: string, cwd?: string, headRef = "HEAD"): string[] =>
  getNonEmptyLines(runGit(["diff", "--name-only", `${baseSha}...${headRef}`], cwd));
