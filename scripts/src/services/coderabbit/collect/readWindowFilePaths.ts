import { readReviewedFilePaths } from "#src/services/coderabbit/collect/readReviewedFilePaths";

// The files the bot's review of a window counts: the diff against the window's base — `main`'s tip for a window cut
// From the bottom, the head of the window below otherwise — through the base's path filters. Three dots count only the
// Head's side of that merge base, so a fold of `main` into a window on `main` adds nothing, while a window stacked on
// Another counts what `main` brought, as the bot does (docs: infra/review-collector/collection-cycle, "Port")
export const readWindowFilePaths = (baseSha: string, cwd?: string, headRef = "HEAD"): string[] =>
  readReviewedFilePaths(baseSha, `${baseSha}...${headRef}`, cwd);
