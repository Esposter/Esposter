import packageJson from "@@/package.json" with { type: "json" };
import { describe, expect, test } from "vitest";

import { nonVitestModules } from "./modules.ts";

const getModuleName = (nuxtModule: (typeof nonVitestModules)[number]) =>
  Array.isArray(nuxtModule) ? nuxtModule[0] : nuxtModule;

describe("modules", () => {
  const SOURCE_PATH_REGEX = /^\.\.\/\.\.\/packages\/[^/]+\/src\/module\.ts$/u;

  const workspacePackageNames = Object.entries({ ...packageJson.dependencies, ...packageJson.devDependencies })
    .filter(([, version]) => version === "workspace:*")
    .map(([name]) => name);

  // `nuxt prepare` loads every module from the app's postinstall, before any workspace package is built, so a bare
  // Package name resolves to a `dist` a fresh clone does not have yet
  test("registers every workspace module by its source path", () => {
    expect.hasAssertions();

    const workspaceModuleNames = nonVitestModules
      .map((nuxtModule) => getModuleName(nuxtModule))
      .filter((moduleName) => typeof moduleName === "string")
      .filter((moduleName) =>
        workspacePackageNames.some(
          (packageName) => moduleName === packageName || moduleName.startsWith(`${packageName}/`),
        ),
      );

    expect(workspaceModuleNames.filter((moduleName) => !SOURCE_PATH_REGEX.test(moduleName))).toStrictEqual([]);
  });
});
