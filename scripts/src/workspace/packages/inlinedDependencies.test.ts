import { getImporterVersions } from "#src/services/outdatedDependencies/lock/getImporterVersions";
import { LOCKFILE_PATH, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

/**
 * The build writes `inlinedDependencies` into each manifest, and a bump of a vendored package moves the version the
 * lockfile resolves without moving the manifest, which only a rebuild rewrites. The `build-packages` job's diff holds
 * that after a full CI build; this holds it in the suite, beside the lockfile it reads.
 *
 * A bare import resolves through the package's own dependencies and then the repository root's, so a name either one
 * holds directly is held to that version. A name reached only through another dependency resolves from that
 * dependency's own tree, which the build's diff holds.
 */
describe("inlinedDependencies", () => {
  test("record the version a bare import of each vendored name resolves to", () => {
    expect.hasAssertions();

    const ROOT_IMPORTER = ".";
    const lockYaml = readFileSync(LOCKFILE_PATH, "utf8");
    const rootVersions = getImporterVersions(lockYaml, ROOT_IMPORTER);
    const mismatches = readWorkspacePackages(REPOSITORY_ROOT).flatMap(({ directory, manifest, workspaceDirectory }) => {
      const packageVersions = getImporterVersions(lockYaml, `${workspaceDirectory}/${directory}`);
      return Object.entries(manifest.inlinedDependencies ?? {}).flatMap(([dependencyName, recordedVersion]) => {
        const resolvedVersion = packageVersions.get(dependencyName) ?? rootVersions.get(dependencyName);
        const recorded = [recordedVersion].flat();
        return resolvedVersion === undefined || recorded.includes(resolvedVersion)
          ? []
          : [`${manifest.name}: ${dependencyName} records ${recorded.join(", ")}, resolves to ${resolvedVersion}`];
      });
    });

    expect(mismatches).toStrictEqual([]);
  });
});
