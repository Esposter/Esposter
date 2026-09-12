import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/RegistryCheckError";

// What one source of outdated dependencies answers: pnpm over the workspace, or the registry over the entries
// Pnpm does not cover.
export interface OutdatedDependencyCheck {
  errors: RegistryCheckError[];
  outdatedDependencies: OutdatedDependency[];
}
