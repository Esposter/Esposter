import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { getRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/getRegistryOutdatedDependencies";
import { getLatestVersion } from "#src/services/shared/getLatestVersion";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/getLatestVersion"), () => ({
  getLatestVersion: vi.fn<typeof getLatestVersion>(),
}));

describe(getRegistryOutdatedDependencies, () => {
  test("reports every entry sharing a package name under its own specifier", async () => {
    expect.hasAssertions();

    const entries: DependencyEntry[] = [
      { group: DependencyGroup.Engines, pkg: "node", specifier: "^26.0.0" },
      { group: DependencyGroup.Engines, pkg: "node", specifier: "^26.8.0" },
    ];
    vi.mocked(getLatestVersion).mockResolvedValue("26.8.1");

    const { outdatedDependencies } = await getRegistryOutdatedDependencies(entries);

    expect(outdatedDependencies).toStrictEqual([
      {
        current: "26.8.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "26.8.1",
        pkg: "node",
        specifier: "^26.8.0",
      },
      {
        current: "26.0.0",
        dependencyType: "engine",
        dependents: ["engines"],
        latest: "26.8.1",
        pkg: "node",
        specifier: "^26.0.0",
      },
    ]);
  });
});
