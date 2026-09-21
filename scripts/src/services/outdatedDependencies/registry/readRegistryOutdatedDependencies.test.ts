import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { readRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/readRegistryOutdatedDependencies";
import { getLatestVersion } from "#src/services/shared/getLatestVersion";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/getLatestVersion"), () => ({
  getLatestVersion: vi.fn<typeof getLatestVersion>(),
}));

describe(readRegistryOutdatedDependencies, () => {
  test("reports every entry sharing a package name under its own specifier", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { group: DependencyGroup.Engines, packageName: "node", specifier: "^26.0.0" },
      { group: DependencyGroup.Engines, packageName: "node", specifier: "^26.8.0" },
    ];
    vi.mocked(getLatestVersion).mockResolvedValue("26.8.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      {
        current: "26.8.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "26.8.1",
        packageName: "node",
        specifier: "^26.8.0",
      },
      {
        current: "26.0.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "26.8.1",
        packageName: "node",
        specifier: "^26.0.0",
      },
    ]);
  });

  test("asks the registry for a followed tag and labels the row with it", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { followTag: "rc", group: DependencyGroup.Catalog, packageName: "a", specifier: "1.0.0-rc.0" },
    ];
    vi.mocked(getLatestVersion).mockResolvedValue("1.0.0-rc.1");

    const { outdatedDependencies } = await readRegistryOutdatedDependencies(entries);

    expect(getLatestVersion).toHaveBeenCalledWith("a", "rc");
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
});
