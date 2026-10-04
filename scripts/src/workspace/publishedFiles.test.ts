import { PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { NON_SOURCE_SUFFIXES } from "@esposter/configuration";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// `pnpm pack` reads the same `files` the release's `npm-packlist` does, and is the packer the repo already runs
const readPackedPaths = (packageDirectory: string): string[] => {
  const output = execFileSync(PNPM_FILE, [...PNPM_ARGS, "pack", "--dry-run", "--json"], {
    cwd: join(REPOSITORY_ROOT, packageDirectory),
    encoding: "utf8",
  });
  const { files } = parseMachineJson<{ files: { path: string }[] }>(output);
  return files.map(({ path }) => path);
};

/**
 * A package's `files` is the one statement of what a stranger downloads, and nothing reads it until a release: every
 * build, test and typecheck here runs against the checkout. A built package lists its `dist`, which the build writes
 * from entries no test reaches; a plugin that ships its source lists its directories and excludes what sits beside
 * that source, which a pattern scoped to one directory stops doing the day a test lands in another. So the pack
 * itself is read, rather than the patterns.
 */
describe("publishedFiles", () => {
  const publishedPackages = readWorkspacePackages(REPOSITORY_ROOT).filter(({ manifest }) => !manifest.private);

  test("pack no test, benchmark or fixture", () => {
    expect.hasAssertions();

    // Named rather than counted: the failure names the file and the package that would ship it
    const nonSourcePaths = publishedPackages.flatMap(({ directory, manifest, workspaceDirectory }) =>
      readPackedPaths(join(workspaceDirectory, directory))
        .filter((path) => NON_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix)))
        .map((path) => `${manifest.name}: ${path}`),
    );

    expect(nonSourcePaths).toStrictEqual([]);
  });
});
