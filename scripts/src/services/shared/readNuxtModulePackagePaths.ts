import { NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// The workspace packages that ship a Nuxt module entry, each as a path from the repository root
export const readNuxtModulePackagePaths = (): string[] =>
  readWorkspacePackageDirectories(REPOSITORY_ROOT).filter((packagePath) =>
    existsSync(resolve(REPOSITORY_ROOT, packagePath, NUXT_MODULE_ENTRY_PATH)),
  );
