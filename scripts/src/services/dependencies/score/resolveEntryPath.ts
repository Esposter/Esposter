import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { readCondition } from "#src/services/dependencies/score/readCondition";
import { checkIsPlainObject } from "@esposter/shared";

export const resolveEntryPath = (manifest: InstalledManifest): string | undefined => {
  // An `exports` map carrying subpath keys names its root under `.`, and a bare conditions object is the root itself
  const { exports } = manifest;
  const root = checkIsPlainObject(exports) && "." in exports ? exports["."] : exports;

  return readCondition(root, "import") ?? readCondition(root, "require") ?? manifest.main;
};
