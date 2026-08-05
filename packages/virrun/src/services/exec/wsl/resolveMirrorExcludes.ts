import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { readLinkedWorktreePaths } from "@/services/exec/util/readLinkedWorktreePaths";
import { toRootAnchoredExclude } from "@/services/exec/util/toRootAnchoredExclude";
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
// Every derived entry is root-anchored (toRootAnchoredExclude) because it names one place in the tree: left bare, a
// Single-segment one (`git worktree add app`, a root nuxt.config's `.nuxt`) would read as a name matching at any
// Depth and drop every `packages/*/app` from the mirror and the write-back. Only the two constants above are
// Genuinely depth-free names.
//
// `outputs` is the run's already-resolved prepare outputs, and it is required rather than re-derived here: this
// Function cannot tell an absent `environment` from one passed programmatically, and re-reading `virrun.config` to
// Guess would answer the second case with the first — the mirror walk would keep the framework outputs while the
// Write-back masked them, or mask what the walk kept. Both callers resolve from the SAME `environment` instead
// (createVirrun for the mask, createWslOsBackend for the walk), which is what makes the two directions one set
// Rather than two that happen to agree.
//
// The patterns feed the host manifest walk (buildSourceMirrorManifest), and the walk's manifest is the single source
// Of truth for the mirrored set — the archive data plane copies exactly the manifest's paths. They feed the
// Write-back mask too (createVirrun's `maskedPaths`): the two directions are one rule, since a path the sandbox never
// Received from the host is a path it may never hand back — an upper entry under one can only have come from stale
// Mirror content, and flushing it resurrects a tree the host deleted.
export const resolveMirrorExcludes = (cwd: string, outputs: readonly string[]): readonly string[] => [
  NODE_MODULES_DIRECTORY,
  GIT_DIRECTORY,
  ...[...readLinkedWorktreePaths(cwd), ...outputs].map((path) => toRootAnchoredExclude(path)),
];
