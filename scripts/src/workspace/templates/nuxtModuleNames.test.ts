import { NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readNuxtModulePackagePaths } from "#src/services/shared/readNuxtModulePackagePaths";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A Nuxt module's name is its package's name: it is the `meta.name` Nuxt logs and keys the module by, the prefix of
 * every hook it declares and the specifier its generated templates import. It is declared once as `MODULE_NAME` in
 * `src/runtime/constants.ts` and the module's `meta.name` reads that, because the constant has to be a literal for the
 * hook names built from it to stay literal types, and a runtime file, which tsdown leaves unbundled, cannot import the
 * manifest from a path that differs between source and build. This check is what keeps the literal equal to the
 * manifest's `name`, so a rename changes one line and the next run names every module still on the old one.
 */
describe("nuxtModuleNames", () => {
  const MODULE_NAME_CONSTANT_PATH = "src/runtime/constants.ts";
  const MODULE_NAME_DECLARATION_REGEX = /export const MODULE_NAME = "(?<name>[^"]+)";/u;
  const MODULE_META_NAME_REGEX = /^\s*meta: \{.*\bname: MODULE_NAME\b/mu;
  const workspacePackages = readWorkspacePackages(REPOSITORY_ROOT);
  const modulePackagePaths = readNuxtModulePackagePaths();

  test("declare MODULE_NAME as the package's name and use it as meta.name", () => {
    expect.hasAssertions();

    const mismatches = modulePackagePaths.flatMap((packagePath) => {
      const packageName = workspacePackages.find(({ directory }) => packagePath.endsWith(directory))?.manifest.name;
      const constantsSource = readFileSync(resolve(REPOSITORY_ROOT, packagePath, MODULE_NAME_CONSTANT_PATH), "utf8");
      const moduleSource = readFileSync(resolve(REPOSITORY_ROOT, packagePath, NUXT_MODULE_ENTRY_PATH), "utf8");
      const declaredName = MODULE_NAME_DECLARATION_REGEX.exec(constantsSource)?.groups?.name;
      return [
        ...(declaredName === packageName ? [] : [`${packagePath}: MODULE_NAME is ${declaredName}, not ${packageName}`]),
        ...(MODULE_META_NAME_REGEX.test(moduleSource) ? [] : [`${packagePath}: meta.name is not MODULE_NAME`]),
      ];
    });

    expect(modulePackagePaths).not.toStrictEqual([]);
    expect(mismatches).toStrictEqual([]);
  });
});
