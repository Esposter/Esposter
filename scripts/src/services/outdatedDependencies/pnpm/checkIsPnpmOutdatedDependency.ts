import type { PnpmOutdatedDependency } from "#src/models/outdatedDependencies/pnpm/PnpmOutdatedDependency";

// Only `latest` is required; pnpm omits or reshapes the other fields, so treat them as optional when building.
export const checkIsPnpmOutdatedDependency = (value: unknown): value is PnpmOutdatedDependency =>
  typeof value === "object" && value !== null && "latest" in value && typeof value.latest === "string";
