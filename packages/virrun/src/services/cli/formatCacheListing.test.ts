import { formatCacheListing } from "@/services/cli/formatCacheListing";
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
      }),
    ).toBe("[virrun] repo store /repo/.virrun/store (present)\n[virrun] snapshots /home/.virrun/snapshots (2): ,  ");
  });

  test("reports an absent store and no snapshots", () => {
    expect.hasAssertions();

    expect(
      formatCacheListing({
        isRepoStorePresent: false,
        repoStorePath: "/repo/.virrun/store",
        snapshotHashes: [],
        snapshotsPath: "/home/.virrun/snapshots",
      }),
    ).toBe("[virrun] repo store /repo/.virrun/store (absent)\n[virrun] snapshots /home/.virrun/snapshots (none)");
  });
});
