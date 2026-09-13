import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getWorkspacePackageDirectories } from "#src/services/shared/getWorkspacePackageDirectories";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * `getBenchmarkReporters` names the reporter as the bare specifier `@esposter/shared-node/reporter` rather than
 * importing it, because `configuration` builds before `shared-node` — so Vitest resolves it from wherever the run
 * started, and every directory a run can start in has to have the package linked there. Nothing else states that:
 * no file imports it, so a manifest that drops it still typechecks, still lints and still builds, and the bench
 * that would have caught it rewrites its own `*.bench.md` and sits in no check suite. The failure surfaces a
 * workflow later as `Failed to load custom Reporter from @esposter/shared-node/reporter`.
 */
const REPORTER_PACKAGE_NAME = "@esposter/shared-node";
const readDevDependencies = (manifestPath: string): Record<string, unknown> => {
  const { devDependencies } = parseMachineJson<{ devDependencies?: Record<string, unknown> }>(
    readFileSync(manifestPath, "utf8"),
  );
  return devDependencies ?? {};
};

describe("benchmark reporter", () => {
  // Discovered from the bench files themselves rather than listed: a listed set stops covering the package that
  // Adds its first bench after this was written, which is one of the two ways the invariant breaks.
  const BENCHING_PACKAGE_PATHS = getWorkspacePackageDirectories(REPOSITORY_ROOT).filter(
    (packagePath) => getSweepFilePaths(`${packagePath}/**/*.bench.ts`).length > 0,
  );
  // The other way, and the one that has already happened: the root owns no bench file, so nothing about the tree
  // Points at it — yet 🏎️ Bench starts its `vitest bench --run` here, which makes the root a run directory with
  // No import to justify the dependency. That asymmetry is exactly what made it read as a leftover when the
  // Dev dependencies serving only the tooling tree were removed. `""` is the root's own directory.
  const RUN_DIRECTORIES = ["", ...BENCHING_PACKAGE_PATHS];

  test("resolves from every directory a bench run can start in", () => {
    expect.hasAssertions();
    // Named rather than counted: the manifest that cannot resolve the reporter names itself in the failure.
    const undeclaredDirectories = RUN_DIRECTORIES.filter(
      (directory) =>
        !(REPORTER_PACKAGE_NAME in readDevDependencies(resolve(REPOSITORY_ROOT, directory, "package.json"))),
    );

    expect(undeclaredDirectories).toStrictEqual([]);
  });

  // The discovery above is the whole test's reach, so a glob that silently matches nothing would leave the check
  // Above asserting the root alone and passing — the vacuous green this pairs with. Cross-checked against the
  // Manifests rather than a listed set: a member declaring `bench` and a member owning a `*.bench.ts` are the same
  // Members by definition, and neither side of that is this file's to choose.
  test("finds the same members that declare a bench script", () => {
    expect.hasAssertions();
    const declaringPackagePaths = getWorkspacePackageDirectories(REPOSITORY_ROOT).filter((packagePath) =>
      Boolean(
        parseMachineJson<{ scripts?: Record<string, unknown> }>(
          readFileSync(resolve(REPOSITORY_ROOT, packagePath, "package.json"), "utf8"),
        ).scripts?.bench,
      ),
    );

    expect(BENCHING_PACKAGE_PATHS).toStrictEqual(declaringPackagePaths);
  });
});
