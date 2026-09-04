import { ROOT_ANCHOR_PREFIX } from "#src/services/exec/util/constants";
// The tree-relative path an anchored exclude names — the inverse of toRootAnchoredExclude, and what every consumer
// That compares a pattern against real paths must go through: the matcher (checkIsExcludedPath) and the mirror's delete
// Derivation (diffSourceMirrorManifests, whose output is spent as a path). A pattern that carries no anchor is
// Already a relative path (`packages/app/.nuxt`) and passes through unchanged.
export const getExcludeRelativePath = (exclude: string): string =>
  exclude.startsWith(ROOT_ANCHOR_PREFIX) ? exclude.slice(ROOT_ANCHOR_PREFIX.length) : exclude;
