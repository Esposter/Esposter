import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { formatText } from "#src/services/package/new/formatText";
import { getLernaVersion } from "#src/services/package/new/getLernaVersion";
import { getPackageEdits } from "#src/services/package/new/getPackageEdits";
import { getPackageFiles } from "#src/services/package/new/getPackageFiles";
import { validatePackageName } from "#src/services/package/new/validatePackageName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Creates a package and makes the edits that list it under `root`, and returns each repository-relative path written.
// Every file is formatted the way the pre-commit hook formats it, so the formatter check reads it as written
export const createPackage = (options: CreatePackageOptions, root: string = REPOSITORY_ROOT): string[] => {
  const { kind, name, register } = options;
  validatePackageName(name, root);
  if (register && kind !== PackageKind.NuxtModule)
    throw new InvalidOperationError(Operation.Create, "package", "--register applies only to a nuxt-module");

  const files = getPackageFiles(options, getLernaVersion(root));
  for (const [path, text] of files) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), formatText(path, text));
  }
  const edits = getPackageEdits(options);
  for (const [path, edit] of edits) {
    const absolutePath = join(root, path);
    writeFileSync(absolutePath, formatText(path, edit(readFileSync(absolutePath, "utf8"))));
  }
  return [...files.keys(), ...edits.keys()];
};
