import { computeEnvironmentKey } from "@/services/exec/snapshot/computeEnvironmentKey";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(resolveSnapshotLocation, () => {
  const { createWorkspace, getCacheHome } = setupTemporaryCacheHome();

  test("addresses the snapshot in the global cache under snapshots/<environment-key> with its upper dir", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    const { dir: snapshotDirectory, hash, upperDir } = resolveSnapshotLocation(workspace);
    const expectedDirectory = join(getCacheHome(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);

    expect(hash).toBe(computeEnvironmentKey(workspace));
    expect(snapshotDirectory).toBe(expectedDirectory);
    expect(upperDir).toBe(join(expectedDirectory, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME));
  });

  test("lives outside the repo so a forked overlay lower never nests inside the source tree", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();

    expect(resolveSnapshotLocation(workspace).dir.startsWith(workspace)).toBe(false);
  });

  test("reports exists only once the upper layer has been captured on disk", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();

    expect(resolveSnapshotLocation(workspace).exists).toBe(false);

    mkdirSync(resolveSnapshotLocation(workspace).upperDir, { recursive: true });

    expect(resolveSnapshotLocation(workspace).exists).toBe(true);
  });
});
