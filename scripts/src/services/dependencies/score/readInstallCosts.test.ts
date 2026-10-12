import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { readInstallCosts } from "#src/services/dependencies/score/readInstallCosts";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readInstallCosts, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "readInstallCosts-test-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // Each package sits in one node_modules beside the others, as pnpm's hoisted layout puts them
  const installPackage = (name: string, dependencies: Record<string, string> = {}): InstalledPackage => {
    const packageDirectory = join(directory, "node_modules", name);
    mkdirSync(packageDirectory, { recursive: true });
    const manifest = { dependencies, name, version: "1.0.0" };
    writeFileSync(join(packageDirectory, "package.json"), JSON.stringify(manifest));
    writeFileSync(join(packageDirectory, "index.js"), "module.exports = {};\n");
    return { directory: packageDirectory, manifest };
  };

  test("flags a package and the dependency it shares with another catalog package as shared", () => {
    expect.hasAssertions();

    const packageNameInstalledMap = new Map([
      ["a", installPackage("a")],
      ["b", installPackage("b", { a: "1.0.0" })],
    ]);
    const packageNameInstallCostMap = readInstallCosts(packageNameInstalledMap);

    expect(packageNameInstallCostMap.get("a")?.isShared).toBe(true);
    expect(packageNameInstallCostMap.get("b")?.isShared).toBe(true);
  });

  test("leaves a package no other catalog package reaches unshared", () => {
    expect.hasAssertions();

    const packageNameInstalledMap = new Map([
      ["a", installPackage("a")],
      ["b", installPackage("b", { a: "1.0.0" })],
      ["c", installPackage("c")],
    ]);
    const packageNameInstallCostMap = readInstallCosts(packageNameInstalledMap);

    expect(packageNameInstallCostMap.get("c")?.isShared).toBe(false);
  });
});
