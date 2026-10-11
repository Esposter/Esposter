const BARREL_EXPORT_REGEX = /^export \* from "\.\/(?<path>[^"]+)";$/gmu;
const SHARED_SOURCE_PREFIX = "packages/shared/src/";

// The defining files `packages/shared`'s barrel re-exports. knip's default run reads every export of these as an entry
// Export and never reports it, so the dead check is the one that still answers for them.
export const getBarrelPaths = (barrelText: string): Set<string> =>
  new Set(
    Array.from(barrelText.matchAll(BARREL_EXPORT_REGEX), ({ groups }) => `${SHARED_SOURCE_PREFIX}${groups?.path}`),
  );
