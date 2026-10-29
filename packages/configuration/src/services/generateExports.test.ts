import { generateExports } from "#src/services/generateExports";
import { getComponentName } from "#src/services/getComponentName";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
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

  // A module with no export is a program — listed, it would run on every import of the package — a test or an ambient
  // Declaration is not the package's surface, so only the nested module reaches the barrel, by a posix path
  test("lists every module with an export and nothing else", () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `${TEST_FILENAME}();`);
    writeFileSync(join(sourceDirectory, TEST_FILENAME, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.test.ts`), `export const a = 0;`);
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.d.ts`), `export declare const a: 0;`);
    generateExports(packageDirectory, "typescript");

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}/${TEST_FILENAME}.ts";\n`,
    );
  });

  // The barrel is read in the order perfectionist's `sort-exports` checks it in, which is case-insensitive: a
  // Code-unit sort would put `B` before `a`, and the lint rule reports that
  test("orders the barrel case-insensitively, as the lint rule sorts it", () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(sourceDirectory, "B.ts"), `export type B = 0;`);
    generateExports(packageDirectory, "typescript");

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}.ts";\nexport * from "./B.ts";\n`,
    );
  });

  // A package that stops generating a barrel keeps no stale one: an earlier build's would still be typechecked
  test("removes the barrels an earlier answer wrote and this one does not", () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, TEST_FILENAME, `${TEST_FILENAME}.ts`), `export const a = 0;`);
    generateExports(packageDirectory, "typescript");
    generateExports(packageDirectory, "none");

    expect(existsSync(join(sourceDirectory, "index.ts"))).toBe(false);
  });

  // A module under a lazy directory is loaded by its own `import()`, so a barrel line for it would load it with the entry
  test("leaves the modules of a lazy directory out of the barrel and keeps the others", () => {
    expect.hasAssertions();

    const lazyDirectory = join(sourceDirectory, TEST_FILENAME, "lazy");
    mkdirSync(lazyDirectory, { recursive: true });
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(lazyDirectory, `${TEST_FILENAME}.ts`), `export type B = 0;`);
    generateExports(packageDirectory, "typescript", [`${TEST_FILENAME}/lazy`]);

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(`export * from "./${TEST_FILENAME}.ts";\n`);
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

  test("exports every component at any depth by its path's name", () => {
    expect.hasAssertions();

    mkdirSync(join(sourceDirectory, "components", TEST_FILENAME), { recursive: true });
    writeFileSync(join(sourceDirectory, "components", TEST_FILENAME, "B.vue"), "<template><i /></template>");
    generateExports(packageDirectory, "vue");

    expect(readFileSync(join(sourceDirectory, "components", "index.ts"), "utf8")).toBe(
      `export { default as ${getComponentName(`${TEST_FILENAME}/B.vue`)} } from "./${TEST_FILENAME}/B.vue";
`,
    );
  });
});
