import type { ManifestDependency } from "#src/models/outdatedDependencies/ManifestDependency";

// A manifest npm installs states its own ranges by necessity — npm reads neither protocol — so its dependencies
// Are checked as the npm group rather than flagged here.
export const getUncatalogedManifestDependencies = (
  manifestDependencies: ManifestDependency[],
  npmManifestPaths: Set<string>,
): ManifestDependency[] =>
  manifestDependencies.filter(
    ({ manifestPath, specifier }) =>
      !npmManifestPaths.has(manifestPath) && !specifier.startsWith("catalog:") && !specifier.startsWith("workspace:"),
  );
