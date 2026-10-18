import { PackageKind } from "#src/models/package/PackageKind";
import {
  AGENTS_FILE,
  APP_MODULES_FILE,
  LERNA_FILE,
  QUALITY_LEDGER_FILE,
  README_FILE,
} from "#src/services/package/new/constants";
import { createPackage } from "#src/services/package/new/createPackage";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, onTestFinished, test } from "vitest";

const readRepositoryLines = (root: string, path: string): string[] =>
  readFileSync(join(root, path), "utf8").split("\n");
const readManifest = (root: string, packageDirectory: string): Record<string, unknown> =>
  parseMachineJson<Record<string, unknown>>(readFileSync(join(root, packageDirectory, "package.json"), "utf8"));

// Each test generates into a copy of the real files the edits anchor to, so the anchors are the repository's own.
// The checkout is never written, and the copies are removed when the test ends
describe(createPackage, () => {
  const FIXTURE_PATHS = [AGENTS_FILE, APP_MODULES_FILE, LERNA_FILE, QUALITY_LEDGER_FILE, README_FILE];
  const createFixtureRoot = (): string => {
    const root = mkdtempSync(join(tmpdir(), "package-new-"));
    onTestFinished(() => rmSync(root, { force: true, recursive: true }));
    for (const path of FIXTURE_PATHS) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      copyFileSync(join(REPOSITORY_ROOT, path), join(root, path));
    }
    return root;
  };

  test("writes a library at lerna's version with the scripts it needs and no bench", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    const { version } = parseMachineJson<{ version: string }>(readFileSync(join(root, LERNA_FILE), "utf8"));
    const written = createPackage(
      { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: false },
      root,
    );
    const manifest = readManifest(root, "packages/demo-library");

    // The set, not the order: the edits and files are written in the order their maps hold them
    expect(written.toSorted()).toStrictEqual(
      [
        "packages/demo-library/package.json",
        "packages/demo-library/tsconfig.json",
        "packages/demo-library/vitest.config.ts",
        "packages/demo-library/eslint.config.js",
        "packages/demo-library/README.md",
        "packages/demo-library/src/demoLibrary.ts",
        "packages/demo-library/tsdown.config.ts",
        AGENTS_FILE,
        README_FILE,
        QUALITY_LEDGER_FILE,
      ].toSorted(),
    );
    expect(manifest.version).toBe(version);
    expect(manifest.sideEffects).toBe(false);
    expect(Object.keys(manifest.scripts as object)).toStrictEqual([
      "build",
      "format",
      "format:check",
      "lint",
      "lint:fix",
      "test",
      "typecheck",
    ]);
  });

  test("lists the library in the agent guide and the root README, cell by cell", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    createPackage(
      { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: false },
      root,
    );
    // The formatter pads a table's cells, so the row is compared by its trimmed cells rather than its characters
    const readRowCells = (path: string): string[][] =>
      readRepositoryLines(root, path)
        .filter((line) => line.includes("`packages/demo-library`"))
        .map((line) =>
          line
            .split("|")
            .map((cell) => cell.trim())
            .slice(1, -1),
        );

    expect(readRowCells(AGENTS_FILE)).toStrictEqual([["`packages/demo-library`", "`demo-library`", "A demo library."]]);
    expect(readRowCells(README_FILE)).toStrictEqual([
      [
        "[`packages/demo-library`](https://github.com/Esposter/Esposter/tree/main/packages/demo-library)",
        "A demo library.",
      ],
    ]);
  });

  test("gives a nuxt-module the shared Nuxt module tsconfig, a module entry and its registration in the app's module list", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    createPackage(
      { description: "A demo module.", kind: PackageKind.NuxtModule, name: "demo-nuxt-module", register: true },
      root,
    );
    const modules = readRepositoryLines(root, APP_MODULES_FILE);

    expect(
      parseMachineJson<{ extends: string }>(readFileSync(join(root, "packages/demo-nuxt-module/tsconfig.json"), "utf8"))
        .extends,
    ).toBe("../configuration/tsconfig.nuxt-module.json");
    expect(modules).toContain('const DEMO_NUXT_MODULE_MODULE_PATH = "../../packages/demo-nuxt-module/src/module.ts";');
    expect(modules).toContain("  DEMO_NUXT_MODULE_MODULE_PATH,");
  });

  test("writes a plugin as a private scoped package with a plugin manifest and no build", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    createPackage(
      { description: "A demo plugin.", kind: PackageKind.Plugin, name: "demo-plugin", register: false },
      root,
    );
    const manifest = readManifest(root, "packages/demo-plugin");

    expect(manifest.name).toBe("@esposter/demo-plugin");
    expect(manifest.private).toBe(true);
    expect(existsSync(join(root, "packages/demo-plugin/tsdown.config.ts"))).toBe(false);
    expect(existsSync(join(root, "packages/demo-plugin/.claude-plugin/plugin.json"))).toBe(true);
  });

  test("refuses a name that a directory already holds", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    createPackage(
      { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: false },
      root,
    );

    expect(() =>
      createPackage(
        { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: false },
        root,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: package, demo-library already has a package]`,
    );
  });

  test("refuses a name that is not lowercase words joined by hyphens", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();

    expect(() =>
      createPackage(
        { description: "A demo library.", kind: PackageKind.Library, name: "Demo_Library", register: false },
        root,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: package, the name is lowercase words joined by single hyphens, such as nuxt-security-module]`,
    );
  });

  test("refuses --register for a kind that is not a nuxt-module", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();

    expect(() =>
      createPackage(
        { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: true },
        root,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: package, --register applies only to a nuxt-module]`,
    );
  });

  test("an edit that finds no anchor throws before any package file is written, so a retry is not refused", () => {
    expect.hasAssertions();

    const root = createFixtureRoot();
    writeFileSync(join(root, README_FILE), "# Nothing to anchor to\n");

    expect(() =>
      createPackage(
        { description: "A demo library.", kind: PackageKind.Library, name: "demo-library", register: false },
        root,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: package, no row matches ^\\| \\[\`packages\\/]`,
    );
    expect(existsSync(join(root, "packages/demo-library"))).toBe(false);
  });
});
