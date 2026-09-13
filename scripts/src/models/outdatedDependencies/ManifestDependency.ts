import type { DependencyField } from "#src/models/shared/DependencyField";

export interface ManifestDependency {
  field: DependencyField;
  manifestName: string;
  manifestPath: string;
  pkg: string;
  specifier: string;
}
