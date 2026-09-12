import type { ManifestDependency } from "#src/models/outdatedDependencies/ManifestDependency";

export const getUncatalogedManifestDependencies = (manifestDependencies: ManifestDependency[]): ManifestDependency[] =>
  manifestDependencies.filter(
    ({ specifier }) => !specifier.startsWith("catalog:") && !specifier.startsWith("workspace:"),
  );
