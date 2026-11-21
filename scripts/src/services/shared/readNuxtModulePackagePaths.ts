import type { PackageManifest } from "@esposter/configuration";

import { checkIsNuxtModuleManifest } from "#src/services/shared/checkIsNuxtModuleManifest";
import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The workspace packages that are Nuxt modules, each as a path from the repository root
export const readNuxtModulePackagePaths = (): string[] =>
  readWorkspacePackageDirectories(REPOSITORY_ROOT).filter((packagePath) =>
    checkIsNuxtModuleManifest(
      parseMachineJson<PackageManifest>(
        readFileSync(resolve(REPOSITORY_ROOT, packagePath, PACKAGE_JSON_FILENAME), "utf8"),
      ),
    ),
  );
