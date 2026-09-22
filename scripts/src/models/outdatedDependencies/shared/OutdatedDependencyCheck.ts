import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";

// What one source of outdated dependencies answers: pnpm over the workspace, or the registry over the entries
// `pnpm` does not cover.
export interface OutdatedDependencyCheck {
  errors: RegistryCheckError[];
  outdatedDependencies: OutdatedDependency[];
}
