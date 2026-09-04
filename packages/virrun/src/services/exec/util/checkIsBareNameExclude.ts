// Whether an exclude pattern is a bare name — the shape that matches that segment at ANY depth (`node_modules`,
// `.git`), as opposed to a root-anchored path (`./app`, `packages/app/.nuxt`) that matches one place in the tree.
// The single home of that test, because three sites branch on it and each would otherwise re-derive it from the
// String: the matcher (checkIsExcludedPath), the mirror's rebuild trigger (createWslSourceMirrorSync — a bare name is the
// One shape a delete list cannot target) and the delete derivation (diffSourceMirrorManifests). A derived tree path
// Is anchored by toRootAnchoredExclude precisely so a single-segment one (`git worktree add app`, a root
// Nuxt.config's `.nuxt`) can never arrive here as a floating name and mask every `packages/*/app` in the repo.
export const checkIsBareNameExclude = (exclude: string): boolean => !exclude.includes("/");
