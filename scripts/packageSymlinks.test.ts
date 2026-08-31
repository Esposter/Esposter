import { execFileSync } from "node:child_process";
import { readlinkSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The pnpm directory fetcher packs a workspace package whenever it is injected — which `pnpm deploy` always does, for
 * the Azure Functions release — and rejects any entry resolving outside the package root with
 * `ERR_PNPM_DIRECTORY_FETCHER_PATH_ESCAPE`. It walks the whole directory, so neither `files`, nor `--legacy`, nor the
 * node linker excuses the link. Nothing else fails until the deploy job does, on a push to `develop` or `main`.
 */
describe("workspace package symlinks", () => {
  const GIT_SYMLINK_MODE = "120000";
  const repositoryRoot = resolve(import.meta.dirname, "..");

  test("never resolve outside their own package", () => {
    expect.hasAssertions();

    const trackedPackageFiles = execFileSync("git", ["ls-files", "-s", "--", "packages"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).split("\n");
    const escapingSymlinkPaths = trackedPackageFiles.flatMap((file) => {
      if (!file.startsWith(GIT_SYMLINK_MODE)) return [];

      const path = file.slice(file.indexOf("\t") + 1);
      const packageRoot = resolve(repositoryRoot, path.split("/").slice(0, 2).join("/"));
      const target = resolve(repositoryRoot, dirname(path), readlinkSync(resolve(repositoryRoot, path)));
      return relative(packageRoot, target).startsWith("..") ? [path] : [];
    });

    expect(escapingSymlinkPaths).toStrictEqual([]);
  });
});
