import { ROOT_ANCHOR_PREFIX } from "@/services/exec/util/constants";
// Express a tree-relative path as a root-anchored exclude pattern. Every derived exclude — a linked worktree root, an
// Environment's prepare outputs — names ONE place in the tree, but the pattern language reads a slash-free string as
// A bare name matching at any depth, so a single-segment path (`git worktree add app`, a root nuxt.config's `.nuxt`)
// Would silently exclude every `app`/`.nuxt` segment in the repo — dropping `packages/app` from the mirror and
// Masking it out of the write-back. The `./` prefix is what removes the ambiguity, and it is deliberately still a
// Valid relative path so a consumer that spends the pattern as one (diffSourceMirrorManifests' `rm -rf` delete list,
// Run with the mirror tree as cwd) stays correct rather than escaping to an absolute path.
export const toRootAnchoredExclude = (relativePath: string): string => `${ROOT_ANCHOR_PREFIX}${relativePath}`;
