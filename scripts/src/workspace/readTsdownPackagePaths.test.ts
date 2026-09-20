import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getWorkspacePackageDirectories } from "#src/services/shared/getWorkspacePackageDirectories";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe } from "vitest";

// A package builds with tsdown exactly when it has a tsdown config, so the set is discovered rather than listed:
// A listed set silently stops covering the package added after it was written, which is the only way an
// Invariant over the built packages can be broken. Every member the workspace declares, because two of the ones
// That build sit under `apps`. (`apps/web` is a Nuxt application, has no tsdown config, and emits nothing.)
export const readTsdownPackagePaths = (): string[] =>
  getWorkspacePackageDirectories(REPOSITORY_ROOT).filter((packagePath) =>
    existsSync(resolve(REPOSITORY_ROOT, packagePath, "tsdown.config.ts")),
  );

describe.todo("readTsdownPackagePaths");
