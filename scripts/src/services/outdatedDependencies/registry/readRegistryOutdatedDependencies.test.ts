import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { readGitHubActionRelease } from "#src/services/outdatedDependencies/githubActions/readGitHubActionRelease";
import { readLatestVersion } from "#src/services/outdatedDependencies/registry/readLatestVersion";
import { readRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/readRegistryOutdatedDependencies";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/outdatedDependencies/registry/readLatestVersion"), () => ({
  readLatestVersion: vi.fn<typeof readLatestVersion>(),
}));
vi.mock(import("#src/services/outdatedDependencies/githubActions/readGitHubActionRelease"), () => ({
  readGitHubActionRelease: vi.fn<typeof readGitHubActionRelease>(),
}));

describe(readRegistryOutdatedDependencies, () => {
  test("reports every entry sharing a package name under its own version", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { group: DependencyGroup.Engines, packageName: "a", specifier: "^0.0.0" },
      { group: DependencyGroup.Engines, packageName: "a", specifier: "^0.1.0" },
    ];
    vi.mocked(readLatestVersion).mockResolvedValue("0.1.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      { current: "0.1.0", dependencyType: "engine", dependents: ["engines"], latest: "0.1.1", packageName: "a" },
      { current: "0.0.0", dependencyType: "engine", dependents: ["engines"], latest: "0.1.1", packageName: "a" },
    ]);
  });

  test("asks the registry for a followed tag and labels the row with it", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { followTag: "rc", group: DependencyGroup.Catalog, packageName: "a", specifier: "1.0.0-rc.0" },
    ];
    vi.mocked(readLatestVersion).mockResolvedValue("1.0.0-rc.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(readLatestVersion).toHaveBeenCalledWith("a", "rc");
    expect(outdatedDependencies).toStrictEqual([
      { current: "1.0.0-rc.0", dependencyType: "rc", dependents: ["catalog"], latest: "1.0.0-rc.1", packageName: "a" },
    ]);
  });

  test("asks the registry for an alias's target and reads the current version off its resolution", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { followTag: "a", group: DependencyGroup.Catalog, packageName: "a", resolved: "0.0.0", specifier: "npm:b@a" },
    ];
    vi.mocked(readLatestVersion).mockResolvedValue("0.0.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(readLatestVersion).toHaveBeenCalledWith("b", "a");
    expect(outdatedDependencies).toStrictEqual([
      { current: "0.0.0", dependencyType: "a", dependents: ["catalog"], latest: "0.0.1", packageName: "a" },
    ]);
  });

  test("attributes an entry to its own dependent over the group's label", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { dependent: "dependent", group: DependencyGroup.Npm, packageName: "a", specifier: "^0.0.0" },
    ];
    vi.mocked(readLatestVersion).mockResolvedValue("0.0.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      { current: "0.0.0", dependencyType: "npm", dependents: ["dependent"], latest: "0.0.1", packageName: "a" },
    ]);
  });

  test("reports a digest moved under a current version", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { digest: "0".repeat(40), group: DependencyGroup.GitHubActions, packageName: "a", specifier: "0.0.0" },
    ];
    vi.mocked(readGitHubActionRelease).mockResolvedValue({ digest: "1".repeat(40), version: "0.0.0" });

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      {
        current: "0.0.0@0000000",
        dependencyType: "digest",
        dependents: ["github-actions"],
        latest: "0.0.0@1111111",
        packageName: "a",
      },
    ]);
  });

  test("reports a newer version alone, since taking it re-pins the digest", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { digest: "0".repeat(40), group: DependencyGroup.GitHubActions, packageName: "a", specifier: "0.0.0" },
    ];
    vi.mocked(readGitHubActionRelease).mockResolvedValue({ digest: "0".repeat(40), version: "0.0.1" });

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      { current: "0.0.0", dependencyType: "action", dependents: ["github-actions"], latest: "0.0.1", packageName: "a" },
    ]);
  });
});
