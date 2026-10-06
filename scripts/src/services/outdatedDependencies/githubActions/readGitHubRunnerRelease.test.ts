import type { fetchJson as baseFetchJson } from "#src/services/shared/fetchJson";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { readGitHubRunnerRelease } from "#src/services/outdatedDependencies/githubActions/readGitHubRunnerRelease";
import { describe, expect, test, vi } from "vitest";

const { fetchJson } = vi.hoisted(() => ({ fetchJson: vi.fn<typeof baseFetchJson>() }));

vi.mock(import("#src/services/shared/fetchJson"), () => ({ fetchJson: fetchJson as typeof baseFetchJson }));

describe(readGitHubRunnerRelease, () => {
  test("reads the newest image readme, skipping a variant's", async () => {
    expect.hasAssertions();

    fetchJson.mockResolvedValueOnce([
      { name: "Ubuntu0000-Readme.md" },
      { name: "Ubuntu0001-Readme.md" },
      { name: "Ubuntu0002-Arm64-Readme.md" },
    ]);

    await expect(
      readGitHubRunnerRelease({ group: DependencyGroup.GitHubRunners, packageName: "ubuntu", specifier: "00.00" }),
    ).resolves.toStrictEqual({ version: "00.01" });
  });
});
