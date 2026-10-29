import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { getLernaVersion } from "#src/services/package/new/getLernaVersion";
import { getPackageEdits } from "#src/services/package/new/getPackageEdits";
import { getPackageFiles } from "#src/services/package/new/getPackageFiles";
import { validatePackageName } from "#src/services/package/new/validatePackageName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { formatText } from "#src/services/shared/formatText";
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
  const edits = getPackageEdits(options);
  // Every edit is made in memory before any file is written, so an edit that throws leaves no half-created package
  const editedTexts = new Map<string, string>(
    Array.from(edits, ([path, edit]): [string, string] => [
      path,
      formatText(path, edit(readFileSync(join(root, path), "utf8"))),
    ]),
  );
  for (const [path, text] of files) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), formatText(path, text));
  }
  for (const [path, text] of editedTexts) writeFileSync(join(root, path), text);
  return [...files.keys(), ...edits.keys()];
};
