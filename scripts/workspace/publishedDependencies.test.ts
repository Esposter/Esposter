import { DependencyField } from "#scripts/models/DependencyField";
import { getWorkspacePackages } from "#scripts/services/getWorkspacePackages";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The one publishability failure no build gate can see. `deps.onlyImport` checks that every external a bundle
 * leaves is *declared*, and a private sibling in `dependencies` is declared — so the gate passes, publint passes
 * on a manifest that is well-formed, and every local build, test and typecheck passes because the workspace has
 * the sibling on disk. It resolves nothing on a stranger's `npm install`, which is the first place it is ever
 * visible.
 */
describe("published packages", () => {
  const workspacePackages = getWorkspacePackages(resolve(import.meta.dirname, "../.."));
  // Every field a consumer's package manager reads as an edge to resolve. `peerDependenciesMeta` counts for the
  // Same reason the build's allowlist reads it: a name declared only there is still externalized, so a private
  // One is still an import the consumer cannot resolve.
  const INSTALL_DEPENDENCY_FIELDS = [
    DependencyField.Dependencies,
    DependencyField.OptionalDependencies,
    DependencyField.PeerDependencies,
    "peerDependenciesMeta",
  ] as const;
  const privatePackageNames = new Set(
    workspacePackages.filter(({ manifest }) => manifest.private).map(({ manifest }) => manifest.name),
  );

  test("depend on no private sibling", () => {
    expect.hasAssertions();
    // Named rather than counted, as an edge: the failure reads as the broken install it is, rather than as a
    // Package to go and diff.
    const privateDependencyEdges = workspacePackages
      .filter(({ manifest }) => !manifest.private)
      .flatMap(({ manifest }) =>
        INSTALL_DEPENDENCY_FIELDS.flatMap((field) => Object.keys(manifest[field] ?? {}))
          .filter((dependencyName) => privatePackageNames.has(dependencyName))
          .map((dependencyName) => `${manifest.name} -> ${dependencyName}`),
      );

    expect(privateDependencyEdges).toStrictEqual([]);
  });
});
