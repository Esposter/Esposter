import { formatCacheListing } from "@/services/cli/cache/formatCacheListing";
import { describe, expect, test } from "vitest";

describe(formatCacheListing, () => {
  test("reports a present store and lists snapshot hashes", () => {
    expect.hasAssertions();

    expect(
      formatCacheListing({
        isRepoStorePresent: true,
        repoStorePath: "/repo/.virrun/store",
        snapshotHashes: ["", " "],
        snapshotsPath: "/home/.virrun/snapshots",
        taskCount: 3,
        tasksPath: "/home/.virrun/tasks",
      }),
    ).toBe(
      "[virrun] repo store /repo/.virrun/store (present)\n[virrun] snapshots /home/.virrun/snapshots (2): ,  \n[virrun] tasks /home/.virrun/tasks (3)",
    );
  });

  test("reports an absent store, no snapshots, and no tasks", () => {
    expect.hasAssertions();

    expect(
      formatCacheListing({
        isRepoStorePresent: false,
        repoStorePath: "/repo/.virrun/store",
        snapshotHashes: [],
        snapshotsPath: "/home/.virrun/snapshots",
        taskCount: 0,
        tasksPath: "/home/.virrun/tasks",
      }),
    ).toBe(
      "[virrun] repo store /repo/.virrun/store (absent)\n[virrun] snapshots /home/.virrun/snapshots (none)\n[virrun] tasks /home/.virrun/tasks (none)",
    );
  });
});
