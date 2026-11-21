import { generateBarrelLines } from "#src/services/precheck/generateBarrelLines";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { ExportsGeneration } from "@esposter/configuration";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(generateBarrelLines, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "generate-barrel-lines-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("writes a package's barrel lines from its source, leaving the source as it was", () => {
    expect.hasAssertions();

    const sourceDirectory = join(directory, "src");
    mkdirSync(sourceDirectory);
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), "export const a = 1;");

    expect(generateBarrelLines(sourceDirectory, ExportsGeneration.TypeScript, []).source).toStrictEqual([
      `export * from "./${TEST_FILENAME}.ts";`,
    ]);
  });

  test("reads its generator from the configuration's source rather than its built package", () => {
    expect.hasAssertions();

    expect(fileURLToPath(import.meta.resolve("@esposter/configuration/generate-exports"))).toBe(
      join(REPOSITORY_ROOT, "packages/configuration/src/services/generateExports.ts"),
    );
  });
});
