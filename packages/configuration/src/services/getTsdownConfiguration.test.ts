import type { BuildContext } from "tsdown";

import { ExportsGeneration } from "#src/models/ExportsGeneration";
import { getTsdownConfiguration } from "#src/services/getTsdownConfiguration";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Runs the `build:prepare` hook the base configuration gives a package whose manifest declares these exports
const runBuildPrepare = async (
  cwd: string,
  exports: Record<string, Record<string, string> | string>,
  exportsGeneration: ExportsGeneration = ExportsGeneration.TypeScript,
): Promise<void> => {
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ exports }));
  const { hooks } = getTsdownConfiguration({ exportsGeneration });
  // The base configuration gives its hooks as an object, the form tsdown's union also allows as a function
  if (typeof hooks === "object") await hooks["build:prepare"]?.({ options: { cwd } } as unknown as BuildContext);
};

describe(getTsdownConfiguration, () => {
  let packageDirectory = "";
  let sourceDirectory = "";

  beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), "subpath-barrel-"));
    sourceDirectory = join(packageDirectory, "src");
    mkdirSync(join(sourceDirectory, "workers"), { recursive: true });
  });

  afterEach(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  // A folder and a module each named by a subpath's `source` arm are left out of the root barrel, since the subpath reaches them
  test("leaves a subpath arm's folder and module out of the barrel", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, "kept.ts"), "export const kept = 0;");
    writeFileSync(join(sourceDirectory, "save.ts"), "export const save = 0;");
    writeFileSync(join(sourceDirectory, "workers", "index.ts"), "export const workers = 0;");
    writeFileSync(join(sourceDirectory, "workers", "double.ts"), "export const double = 0;");
    await runBuildPrepare(packageDirectory, {
      ".": { default: "./dist/index.js", source: "./src/index.ts" },
      "./save": { default: "./dist/save.js", source: "./src/save.ts" },
      "./workers": { default: "./dist/workers.js", source: "./src/workers/index.ts" },
    });

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(`export * from "./kept.ts";\n`);
  });

  // The root arm names the barrel's own entry, so the module it reads stays in the barrel even though it is not `index.ts`
  test("never leaves out the module the root arm names", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, "kept.ts"), "export const kept = 0;");
    writeFileSync(join(sourceDirectory, "api.ts"), "export const api = 0;");
    await runBuildPrepare(packageDirectory, { ".": { default: "./dist/index.js", source: "./src/api.ts" } });

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./api.ts";\nexport * from "./kept.ts";\n`,
    );
  });

  // A module no arm names stays in the barrel, whatever build entry it is loaded through
  test("keeps a module no export arm names in the barrel", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, "kept.ts"), "export const kept = 0;");
    writeFileSync(join(sourceDirectory, "save.ts"), "export const save = 0;");
    await runBuildPrepare(packageDirectory, { "./package.json": "./package.json" });

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./kept.ts";\nexport * from "./save.ts";\n`,
    );
  });

  // A package that names its entrypoints itself generates no barrel, so there is none for an arm to leave anything out of
  test("writes no barrel for a package that generates none", async () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, "save.ts"), "export const save = 0;");
    await runBuildPrepare(
      packageDirectory,
      { "./save": { default: "./dist/save.js", source: "./src/save.ts" } },
      ExportsGeneration.None,
    );

    expect(existsSync(join(sourceDirectory, "index.ts"))).toBe(false);
  });
});
