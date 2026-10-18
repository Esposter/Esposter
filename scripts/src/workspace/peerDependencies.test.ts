import { DEPENDENCY_FIELDS, DependencyField } from "#src/models/shared/DependencyField";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { describe, expect, test } from "vitest";

/**
 * pnpm's `auto-install-peers` installs every required peer for the package's own build and tests, so a required peer
 * listed under a second field is a second specifier for one install, free to drift from the first. An optional peer is
 * the one kind pnpm leaves out, so a package whose own tests import it also lists it under `devDependencies`.
 */
describe("peerDependencies", () => {
  const workspacePackages = readWorkspacePackages(REPOSITORY_ROOT);
  const OTHER_DEPENDENCY_FIELDS = DEPENDENCY_FIELDS.filter((field) => field !== DependencyField.PeerDependencies);

  test("list each required peer in no other field", () => {
    expect.hasAssertions();

    const duplicateListings = workspacePackages.flatMap(({ manifest }) =>
      Object.keys(manifest.peerDependencies ?? {})
        .filter((dependencyName) => !manifest.peerDependenciesMeta?.[dependencyName]?.optional)
        .flatMap((dependencyName) =>
          OTHER_DEPENDENCY_FIELDS.filter((field) => manifest[field]?.[dependencyName] !== undefined).map(
            (field) => `${manifest.name} -> ${dependencyName} in ${field}`,
          ),
        ),
    );

    expect(duplicateListings).toStrictEqual([]);
  });
});
