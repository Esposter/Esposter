import { getTresPackageNames } from "#src/services/getTresPackageNames";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

let workspaceDirectory: string;

const writeManifest = async (directory: string, manifest: object) => {
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "package.json"), JSON.stringify(manifest));
};

describe("getTresPackageNames", () => {
  beforeEach(async () => {
    workspaceDirectory = await mkdtemp(join(tmpdir(), "tresjs-nuxt-"));
  });
  afterEach(async () => {
    await rm(workspaceDirectory, { force: true, recursive: true });
  });
  test("returns the app's and its parent's @tresjs packages, excluding core, once each", async () => {
    const appDirectory = join(workspaceDirectory, "app");
    await writeManifest(workspaceDirectory, {
      devDependencies: { "@tresjs/cientos": "^5.9.3", "@tresjs/tweakpane": "^1.0.0" },
    });
    await writeManifest(appDirectory, {
      dependencies: { "@tresjs/core": "^5.9.3", "@tresjs/tweakpane": "^1.0.0", lodash: "^4.0.0" },
    });
    expect(await getTresPackageNames(appDirectory)).toStrictEqual(["@tresjs/tweakpane", "@tresjs/cientos"]);
  });
});
