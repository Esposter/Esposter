import type { BuildContext } from "tsdown";

import { BARREL_FILE, SOURCE_DIRECTORY_NAME } from "#src/services/constants";
import { TEST_FILENAME } from "#src/services/fixtureConstants.test";
import { getTsdownConfiguration } from "#src/services/getTsdownConfiguration";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Runs the `build:prepare` hook the base configuration gives a package whose manifest declares these exports
const runBuildPrepare = async (
  cwd: string,
  exports: Record<string, Record<string, string> | string>,
): Promise<void> => {
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ exports }));
  const { hooks } = getTsdownConfiguration();
  // The base configuration gives its hooks as an object, the form tsdown's union also allows as a function
  if (typeof hooks === "object") await hooks["build:prepare"]?.({ options: { cwd } } as unknown as BuildContext);
};

describe(getTsdownConfiguration, () => {
  // A second module beside the first, named by the first's name twice over, since the two must coexist in one folder
  const SECOND_MODULE_NAME = `${TEST_FILENAME}${TEST_FILENAME}.ts`;
  let packageDirectory = "";
  let sourceDirectory = "";

  beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), TEST_FILENAME));
    sourceDirectory = join(packageDirectory, SOURCE_DIRECTORY_NAME);
    mkdirSync(join(sourceDirectory, TEST_FILENAME), { recursive: true });
  });

  afterEach(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  // A folder and a module a subpath's `source` arm names are left out of the root barrel, as the subpath reaches them
  test("leaves a subpath arm's folder and module out of the barrel", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export const ${TEST_FILENAME} = 0;`);
    writeFileSync(join(sourceDirectory, SECOND_MODULE_NAME), `export const ${TEST_FILENAME} = 0;`);
    writeFileSync(join(sourceDirectory, TEST_FILENAME, BARREL_FILE), `export const ${TEST_FILENAME} = 0;`);
    writeFileSync(join(sourceDirectory, TEST_FILENAME, `${TEST_FILENAME}.ts`), `export const ${TEST_FILENAME} = 0;`);
    await runBuildPrepare(packageDirectory, {
      ".": { default: "./dist/index.js", source: `./${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}` },
      [`./${SECOND_MODULE_NAME}`]: {
        default: "./dist/save.js",
        source: `./${SOURCE_DIRECTORY_NAME}/${SECOND_MODULE_NAME}`,
      },
      [`./${TEST_FILENAME}`]: {
        default: "./dist/workers.js",
        source: `./${SOURCE_DIRECTORY_NAME}/${TEST_FILENAME}/${BARREL_FILE}`,
      },
    });

    expect(readFileSync(join(sourceDirectory, BARREL_FILE), "utf8")).toBe(`export * from "./${TEST_FILENAME}.ts";\n`);
  });

  // A module no arm names stays in the barrel, whatever build entry it is loaded through
  test("keeps a module no export arm names in the barrel", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export const ${TEST_FILENAME} = 0;`);
    writeFileSync(join(sourceDirectory, SECOND_MODULE_NAME), `export const ${TEST_FILENAME} = 0;`);
    await runBuildPrepare(packageDirectory, {
      ".": { default: "./dist/index.js", source: `./${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}` },
      "./package.json": "./package.json",
    });

    expect(readFileSync(join(sourceDirectory, BARREL_FILE), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}.ts";\nexport * from "./${SECOND_MODULE_NAME}";\n`,
    );
  });

  // A package whose root export does not name its `src/index.ts` names its entrypoints itself, so it generates no barrel
  test.each([
    { [`./${TEST_FILENAME}`]: { default: "./dist/a.js", source: `./${SOURCE_DIRECTORY_NAME}/${TEST_FILENAME}.ts` } },
    { ".": { default: "./dist/module.js", source: `./${SOURCE_DIRECTORY_NAME}/module.ts` } },
  ])("writes no barrel for the exports %o", async (exports) => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export const ${TEST_FILENAME} = 0;`);
    await runBuildPrepare(packageDirectory, exports);

    expect(existsSync(join(sourceDirectory, BARREL_FILE))).toBe(false);
  });
});
