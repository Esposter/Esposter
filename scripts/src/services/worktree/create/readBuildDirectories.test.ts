import { readBuildDirectories } from "#src/services/worktree/create/readBuildDirectories";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readBuildDirectories, () => {
  let rootDirectory: string;

  const writeManifest = (directory: string, manifest: object) => {
    mkdirSync(join(rootDirectory, directory), { recursive: true });
    writeFileSync(join(rootDirectory, directory, "package.json"), JSON.stringify(manifest));
  };

  beforeEach(() => {
    rootDirectory = mkdtempSync(join(tmpdir(), "read-build-directories-"));
    writeFileSync(join(rootDirectory, "pnpm-workspace.yaml"), "packages:\n  - apps/*\n  - packages/*\n  - scripts\n");
    writeFileSync(join(rootDirectory, "package.json"), JSON.stringify({ name: "root" }));
    writeManifest("scripts", {
      dependencies: { built: "workspace:*", external: "^1.0.0" },
      devDependencies: { unbuilt: "workspace:*" },
      name: "@esposter/scripts",
    });
    writeManifest("packages/built", { name: "built", scripts: { build: "tsdown" } });
    writeManifest("packages/unbuilt", { name: "unbuilt" });
    writeManifest("packages/named", { name: "named", scripts: { build: "tsdown" } });
    writeManifest("apps/web", { name: "@esposter/web", scripts: { build: "nuxt build" } });
  });

  afterEach(() => {
    rmSync(rootDirectory, { force: true, recursive: true });
  });

  test("builds every workspace package the scripts package depends on that has a build", () => {
    expect.hasAssertions();

    expect(readBuildDirectories(rootDirectory, [])).toStrictEqual(["built"]);
  });

  test("a named package builds its own directory", () => {
    expect.hasAssertions();

    expect(readBuildDirectories(rootDirectory, ["named"])).toStrictEqual(["built", "named"]);
  });

  test("a named app builds the packages rather than itself", () => {
    expect.hasAssertions();

    expect(readBuildDirectories(rootDirectory, ["@esposter/web"])).toStrictEqual(["built", "packages"]);
  });
});
