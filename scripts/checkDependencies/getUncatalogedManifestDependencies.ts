import type { ManifestDependency } from "@/checkDependencies/models/ManifestDependency";

export const getUncatalogedManifestDependencies = (manifestDependencies: ManifestDependency[]): ManifestDependency[] =>
  manifestDependencies.filter(
    ({ specifier }) => !specifier.startsWith("catalog:") && !specifier.startsWith("workspace:"),
  );
