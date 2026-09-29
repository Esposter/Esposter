import { generateExports } from "#src/generateExports";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(generateExports, () => {
  const TEST_FILENAME = "a";
  let packageDirectory = "";
  let sourceDirectory = "";

  beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), TEST_FILENAME));
    sourceDirectory = join(packageDirectory, "src");
    mkdirSync(join(sourceDirectory, TEST_FILENAME), { recursive: true });
  });

  afterEach(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  // A module with no export is a program — listed, it would run on every import of the package — and a test or an
  // Ambient declaration is not the package's surface, so only the nested module reaches the barrel, by a posix path
  test("lists every module with an export and nothing else", () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `${TEST_FILENAME}();`);
    writeFileSync(join(sourceDirectory, TEST_FILENAME, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.test.ts`), `export const a = 0;`);
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.d.ts`), `export declare const a: 0;`);
    generateExports(packageDirectory, "typescript");

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}/${TEST_FILENAME}";\n`,
    );
  });

  // A sibling's watcher vendoring this source reads the barrel while it is being written, so an unchanged one is left
  test("leaves an unchanged barrel unwritten", () => {
    expect.hasAssertions();

    const barrelPath = join(sourceDirectory, "index.ts");
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    generateExports(packageDirectory, "typescript");
    utimesSync(barrelPath, 0, 0);
    generateExports(packageDirectory, "typescript");

    expect(statSync(barrelPath).mtimeMs).toBe(0);
  });

  test("exports every component at any depth by its file name", () => {
    expect.hasAssertions();

    mkdirSync(join(sourceDirectory, "components", TEST_FILENAME), { recursive: true });
    writeFileSync(join(sourceDirectory, "components", TEST_FILENAME, "B.vue"), "<template><i /></template>");
    generateExports(packageDirectory, "vue");

    expect(readFileSync(join(sourceDirectory, "components", "index.ts"), "utf8")).toBe(
      `export { default as B } from "./${TEST_FILENAME}/B.vue";
`,
    );
  });
});
