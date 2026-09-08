import type { DependencyField } from "#src/models/DependencyField";

export interface ManifestDependency {
  field: DependencyField;
  manifestName: string;
  manifestPath: string;
  pkg: string;
  specifier: string;
}
