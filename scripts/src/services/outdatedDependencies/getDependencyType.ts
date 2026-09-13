import { DependencyField } from "#src/models/shared/DependencyField";

// The short label the report shows beside a package for every field but plain `dependencies`. Read off a string
// Rather than the enum because pnpm's own report spells the field the same way and hands it over as text.
export const getDependencyType = (field: string): string => {
  if (field === DependencyField.DevDependencies) return "dev";
  if (field === DependencyField.OptionalDependencies) return "optional";
  if (field === DependencyField.PeerDependencies) return "peer";

  return "";
};
