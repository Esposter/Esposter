import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { readRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/readRegistryOutdatedDependencies";
import { readLatestVersion } from "#src/services/shared/readLatestVersion";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/readLatestVersion"), () => ({
  readLatestVersion: vi.fn<typeof readLatestVersion>(),
}));

describe(readRegistryOutdatedDependencies, () => {
  test("reports every entry sharing a package name under its own specifier", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { group: DependencyGroup.Engines, packageName: "a", specifier: "^0.0.0" },
      { group: DependencyGroup.Engines, packageName: "a", specifier: "^0.1.0" },
    ];
    vi.mocked(readLatestVersion).mockResolvedValue("0.1.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      {
        current: "0.1.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "0.1.1",
        packageName: "a",
        specifier: "^0.1.0",
      },
      {
        current: "0.0.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "0.1.1",
        packageName: "a",
        specifier: "^0.0.0",
      },
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
      {
        current: "1.0.0-rc.0",
        dependencyType: "rc",
        dependents: ["catalog"],
        latest: "1.0.0-rc.1",
        packageName: "a",
        specifier: "1.0.0-rc.0",
      },
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
      {
        current: "0.0.0",
        dependencyType: "npm",
        dependents: ["dependent"],
        latest: "0.0.1",
        packageName: "a",
        specifier: "^0.0.0",
      },
    ]);
  });
});
