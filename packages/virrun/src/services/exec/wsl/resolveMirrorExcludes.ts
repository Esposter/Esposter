import { resolvePrepareStep } from "@/services/configuration/resolvePrepareStep";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { readLinkedWorktreePaths } from "@/services/exec/util/readLinkedWorktreePaths";
import { getResult } from "@esposter/shared";
// What never enters the source mirror: node_modules (supplied by the snapshot RO lower — mirrors the write-back
// Rule), .git (large, churns every commit, unread by dev-loop commands), this repository's linked worktrees nested
// Inside the tree (readLinkedWorktreePaths — each is a whole parallel checkout and its own virrun cwd with its own
// Mirror entry, so letting them in multiplies every sync by the worktree count: a real run's delta was tens of
// Thousands of worktree paths dwarfing a few hundred real changes), and an active environment's prepare outputs
// (e.g. .nuxt) — those are owned by the source-keyed
// Prepare layer, so the host's platform-specific copy is kept out entirely: it can't shadow the prepare layer, and
// The prepare-layer capture regenerates a *complete* copy in its own upper rather than reading unchanged files
// Through a host lower. Everything else is mirrored — over-copy is correctness-safe, under-copy is a bug.
//
// Every entry is a structural property of the tree — a cache layer owns it, or git says it is a different working
// Tree — never a name virrun recognises, so no tool that nests a worktree has to be known here to be handled. The
// Set is therefore not constant: worktrees come and go while a repo is worked on, which is why the mirror publishes
// The set it synced under and reconciles a change into targeted deletes (createWslSourceMirrorSync).
//
// Best-effort: a resolution hiccup falls back to the base excludes (the prepare layer still shadows the host copy
// When forking). The patterns feed the host manifest walk (buildSourceMirrorManifest), and the walk's manifest is the
// Single source of truth for the mirrored set — the archive data plane copies exactly the manifest's paths.
// They feed the write-back mask too (createVirrun's `maskedPaths`): the two directions are one rule, since a path
// The sandbox never received from the host is a path it may never hand back — an upper entry under one can only have
// Come from stale mirror content, and flushing it resurrects a tree the host deleted.
export const resolveMirrorExcludes = (cwd: string): readonly string[] => {
  const environment = resolveVirrunConfiguration(cwd)?.environment;
  const outputs = getResult(() => resolvePrepareStep(environment, cwd)?.outputs ?? []).unwrapOr([]);
  return [NODE_MODULES_DIRECTORY, GIT_DIRECTORY, ...readLinkedWorktreePaths(cwd), ...outputs];
};
