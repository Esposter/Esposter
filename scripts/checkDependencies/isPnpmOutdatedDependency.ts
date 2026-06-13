import type { PnpmOutdatedDependency } from "@/checkDependencies/models/PnpmOutdatedDependency";

// Only `latest` is required; pnpm omits or reshapes the other fields for some entries
// (catalog/deprecated packages), so treat them as optional and fall back when building.
export const isPnpmOutdatedDependency = (value: unknown): value is PnpmOutdatedDependency => {
  if (!value || typeof value !== "object") return false;

  const dependency = value as Record<string, unknown>;

  return typeof dependency.latest === "string";
};
