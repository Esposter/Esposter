import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { checkIsRecord } from "#src/services/dependencies/score/checkIsRecord";

// The import condition's entry, else the require condition's, else `main`: the file a package's runtime loads
const readCondition = (value: unknown, condition: string): string | undefined => {
  if (typeof value === "string") return value;
  if (!checkIsRecord(value)) return undefined;

  const target = value[condition];
  if (typeof target === "string") return target;
  return checkIsRecord(target) && typeof target.default === "string" ? target.default : undefined;
};

export const resolveEntryPath = (manifest: InstalledManifest): string | undefined => {
  // An `exports` map carrying subpath keys names its root under `.`, and a bare conditions object is the root itself
  const { exports } = manifest;
  const root = checkIsRecord(exports) && "." in exports ? exports["."] : exports;

  return readCondition(root, "import") ?? readCondition(root, "require") ?? manifest.main;
};
