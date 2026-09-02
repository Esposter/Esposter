import type { DependencyField } from "#scripts/models/DependencyField";

export interface ManifestDependency {
  field: DependencyField;
  manifestName: string;
  manifestPath: string;
  pkg: string;
  specifier: string;
}
