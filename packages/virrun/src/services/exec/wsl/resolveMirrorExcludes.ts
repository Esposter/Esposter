import { resolvePrepareStep } from "@/services/configuration/resolvePrepareStep";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { getResult } from "@esposter/shared";
// What never enters the source mirror: node_modules (supplied by the snapshot RO lower — mirrors the write-back
// Rule), .git (large, churns every commit, unread by dev-loop commands), and an active environment's prepare outputs
// (e.g. .nuxt) — those are owned by the source-keyed prepare layer, so the host's platform-specific copy is kept out
// Entirely: it can't shadow the prepare layer, and the prepare-layer capture regenerates a *complete* copy in its own
// Upper rather than reading unchanged files through a host lower. Everything else is mirrored — over-copy is
// Correctness-safe, under-copy is a bug. Best-effort: a resolution hiccup falls back to the base excludes (the
// Prepare layer still shadows the host copy when forking). The same patterns feed both the host manifest walk
// (buildSourceMirrorManifest) and the full-rsync fallback's `--exclude` args, so the two sides always agree on the
// Mirrored set.
export const resolveMirrorExcludes = (cwd: string): readonly string[] => {
  const environment = resolveVirrunConfiguration(cwd)?.environment;
  const outputs = getResult(() => resolvePrepareStep(environment, cwd)?.outputs ?? []).unwrapOr([]);
  return ["node_modules", ".git", ...outputs];
};
