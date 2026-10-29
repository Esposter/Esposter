import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { PackageFormat } from "#src/models/dependencies/score/PackageFormat";
import { checkHasEntrypoint } from "#src/services/dependencies/score/checkHasEntrypoint";
import { collectConditions } from "#src/services/dependencies/score/collectConditions";
import { TYPES_SCOPE } from "#src/services/dependencies/score/constants";

export const getPackageFormat = (manifest: InstalledManifest): PackageFormat => {
  const isTypesOnly =
    manifest.name?.startsWith(TYPES_SCOPE) ||
    ((manifest.types ?? manifest.typings) !== undefined && !checkHasEntrypoint(manifest));
  if (isTypesOnly) return PackageFormat.Types;

  const conditions = new Set<string>();
  collectConditions(manifest.exports, conditions);
  if (conditions.has("import") && conditions.has("require")) return PackageFormat.Dual;
  if (manifest.type === "module" || conditions.has("import")) return PackageFormat.Esm;
  return PackageFormat.Commonjs;
};
