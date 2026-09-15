import { DependencyField } from "#src/models/shared/DependencyField";

// The short label the report shows beside a package for every field but plain `dependencies`. Keyed by a string
// Rather than the enum because pnpm's own report spells the field the same way and hands it over as text.
const DependencyFieldLabelMap = new Map<string, string>([
  [DependencyField.DevDependencies, "dev"],
  [DependencyField.OptionalDependencies, "optional"],
  [DependencyField.PeerDependencies, "peer"],
]);

export const getDependencyType = (field: string): string => DependencyFieldLabelMap.get(field) ?? "";
