import { formatCacheListing } from "@/services/cli/cache/formatCacheListing";
import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { describe, expect, test } from "vitest";

describe(formatCacheListing, () => {
  test("reports a present store and lists snapshot hashes and prepare keys", () => {
    expect.hasAssertions();

    expect(
      stripAnsi(
        formatCacheListing({
          isRepoStorePresent: true,
          prepareKeys: [""],
          preparePath: "/home/.virrun/prepare",
          repoStorePath: "/repo/.virrun/store",
          snapshotHashes: ["", " "],
          snapshotsPath: "/home/.virrun/snapshots",
          taskCount: 3,
          tasksPath: "/home/.virrun/tasks",
        }),
      ),
    ).toBe(
      "[virrun] repo store /repo/.virrun/store (present)\n[virrun] snapshots /home/.virrun/snapshots (2): ,  \n[virrun] prepare /home/.virrun/prepare (1): \n[virrun] tasks /home/.virrun/tasks (3)",
    );
  });

  test("reports an absent store, no snapshots, no prepare layers, and no tasks", () => {
    expect.hasAssertions();

    expect(
      stripAnsi(
        formatCacheListing({
          isRepoStorePresent: false,
          prepareKeys: [],
          preparePath: "/home/.virrun/prepare",
          repoStorePath: "/repo/.virrun/store",
          snapshotHashes: [],
          snapshotsPath: "/home/.virrun/snapshots",
          taskCount: 0,
          tasksPath: "/home/.virrun/tasks",
        }),
      ),
    ).toBe(
      "[virrun] repo store /repo/.virrun/store (absent)\n[virrun] snapshots /home/.virrun/snapshots (none)\n[virrun] prepare /home/.virrun/prepare (none)\n[virrun] tasks /home/.virrun/tasks (none)",
    );
  });
});
