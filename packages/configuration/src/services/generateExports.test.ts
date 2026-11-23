import { ExportsGeneration } from "#src/models/ExportsGeneration";
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
    generateExports(packageDirectory, ExportsGeneration.TypeScript);

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}/${TEST_FILENAME}.ts";\n`,
    );
  });

  // The barrel is read in the order `sorting/sort-exports` checks it in, which is case-insensitive: a
  // Code-unit sort would put `B` before `a`, and the lint rule reports that
  test("orders the barrel case-insensitively, as the lint rule sorts it", () => {
    expect.hasAssertions();

    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(sourceDirectory, "B.ts"), `export type B = 0;`);
    generateExports(packageDirectory, ExportsGeneration.TypeScript);

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(
      `export * from "./${TEST_FILENAME}.ts";\nexport * from "./B.ts";\n`,
    );
  });

  // A package that stops generating a component barrel keeps no stale one: an earlier build's would still be typechecked
  test("removes the component barrel an earlier Vue answer wrote and a later answer does not", () => {
    expect.hasAssertions();

    mkdirSync(join(sourceDirectory, "components"), { recursive: true });
    writeFileSync(join(sourceDirectory, "components", `${TEST_FILENAME}.vue`), "<template><i /></template>");
    generateExports(packageDirectory, ExportsGeneration.Vue);
    generateExports(packageDirectory, ExportsGeneration.TypeScript);

    expect(existsSync(join(sourceDirectory, "components", "index.ts"))).toBe(false);
  });

  // A module under a lazy directory is loaded by its own `import()`, so a barrel line for it would load it with the entry
  test("leaves the modules of a lazy directory out of the barrel and keeps the others", () => {
    expect.hasAssertions();

    const lazyDirectory = join(sourceDirectory, TEST_FILENAME, "lazy");
    mkdirSync(lazyDirectory, { recursive: true });
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(lazyDirectory, `${TEST_FILENAME}.ts`), `export type B = 0;`);
    generateExports(packageDirectory, ExportsGeneration.TypeScript, [`${TEST_FILENAME}/lazy`]);

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(`export * from "./${TEST_FILENAME}.ts";\n`);
  });

  // A component under a lazy directory is loaded by its own `import()` as its source is, so the component barrel leaves it out
  test("leaves the components of a lazy directory out of the component barrel", () => {
    expect.hasAssertions();

    const componentsDirectory = join(sourceDirectory, "components");
    mkdirSync(join(componentsDirectory, "lazy"), { recursive: true });
    writeFileSync(join(componentsDirectory, `${TEST_FILENAME}.vue`), "<template><i /></template>");
    writeFileSync(join(componentsDirectory, "lazy", `${TEST_FILENAME}.vue`), "<template><i /></template>");
    generateExports(packageDirectory, ExportsGeneration.Vue, ["components/lazy"]);

    expect(readFileSync(join(componentsDirectory, "index.ts"), "utf8")).toBe(
      `export { default as ${getComponentName(`${TEST_FILENAME}.vue`)} } from "./${TEST_FILENAME}.vue";
`,
    );
  });

  // A module under `internal` is private to its package, so no barrel lists it, while a module beside that folder is still listed
  test("leaves a module under internal out of the barrel and keeps a sibling outside it", () => {
    expect.hasAssertions();

    const internalDirectory = join(sourceDirectory, "internal", "services");
    mkdirSync(internalDirectory, { recursive: true });
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    writeFileSync(join(internalDirectory, `${TEST_FILENAME}.ts`), `export type B = 0;`);
    generateExports(packageDirectory, ExportsGeneration.TypeScript);

    expect(readFileSync(join(sourceDirectory, "index.ts"), "utf8")).toBe(`export * from "./${TEST_FILENAME}.ts";\n`);
  });

  // A sibling's watcher vendoring this source reads the barrel while it is being written, so an unchanged one is left
  test("leaves an unchanged barrel unwritten", () => {
    expect.hasAssertions();

    const barrelPath = join(sourceDirectory, "index.ts");
    writeFileSync(join(sourceDirectory, `${TEST_FILENAME}.ts`), `export type A = 0;`);
    generateExports(packageDirectory, ExportsGeneration.TypeScript);
    utimesSync(barrelPath, 0, 0);
    generateExports(packageDirectory, ExportsGeneration.TypeScript);

    expect(statSync(barrelPath).mtimeMs).toBe(0);
  });

  test("exports every component at any depth by its path's name", () => {
    expect.hasAssertions();

    mkdirSync(join(sourceDirectory, "components", TEST_FILENAME), { recursive: true });
    writeFileSync(join(sourceDirectory, "components", TEST_FILENAME, "B.vue"), "<template><i /></template>");
    generateExports(packageDirectory, ExportsGeneration.Vue);

    expect(readFileSync(join(sourceDirectory, "components", "index.ts"), "utf8")).toBe(
      `export { default as ${getComponentName(`${TEST_FILENAME}/B.vue`)} } from "./${TEST_FILENAME}/B.vue";
`,
    );
  });
});
