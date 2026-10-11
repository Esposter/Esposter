import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { PackageFormat } from "#src/models/dependencies/score/PackageFormat";
import { checkIsRecord } from "#src/services/dependencies/score/checkIsRecord";
import { TYPES_SCOPE } from "#src/services/dependencies/score/constants";

// Every condition an `exports` map names at any depth, a subpath key (`.`, `./x`) excluded since it names no condition
const collectConditions = (value: unknown, conditions: Set<string>): void => {
  if (!checkIsRecord(value)) return;

  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith(".")) conditions.add(key);
    collectConditions(child, conditions);
  }
};

const checkHasEntrypoint = ({ exports, main, module }: InstalledManifest): boolean =>
  exports !== undefined || main !== undefined || module !== undefined;

export const getPackageFormat = (manifest: InstalledManifest): PackageFormat => {
  const isTypesOnly =
    manifest.name?.startsWith(TYPES_SCOPE) ||
    ((manifest.types ?? manifest.typings) !== undefined && !checkHasEntrypoint(manifest));
  if (isTypesOnly) return PackageFormat.Types;
  if (manifest.type === "module") return PackageFormat.Esm;

  const conditions = new Set<string>();
  collectConditions(manifest.exports, conditions);
  if (conditions.has("import") && conditions.has("require")) return PackageFormat.Dual;
  if (conditions.has("import")) return PackageFormat.Esm;
  return PackageFormat.Commonjs;
};
