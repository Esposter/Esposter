import type { ClaimedRef } from "#src/models/shared/ClaimedRef";
import type { readClaimedRefs as baseReadClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import type { removeHoldFile as baseRemoveHoldFile } from "#src/services/fleet/removeHoldFile";
import type { runFleetRefGit as baseRunFleetRefGit } from "#src/services/fleet/runFleetRefGit";

import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { releaseFleetEntry } from "#src/services/fleet/releaseFleetEntry";
import { REMOTE_NAME } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { readClaimedRefs, removeHoldFile, runFleetRefGit } = vi.hoisted(() => ({
  readClaimedRefs: vi.fn<typeof baseReadClaimedRefs>(),
  removeHoldFile: vi.fn<typeof baseRemoveHoldFile>(),
  runFleetRefGit: vi.fn<typeof baseRunFleetRefGit>(),
}));

vi.mock(import("#src/services/fleet/readClaimedRefs"), () => ({ readClaimedRefs }));
vi.mock(import("#src/services/fleet/removeHoldFile"), () => ({ removeHoldFile }));
vi.mock(import("#src/services/fleet/runFleetRefGit"), () => ({ runFleetRefGit }));

describe(releaseFleetEntry, () => {
  const ENTRY = "first";
  const HOLDER = { machine: "pc", worker: "7f3a" };
  const REF = `${CLAIM_REF_PREFIX}${ENTRY}`;
  const { commitFile, getCwd } = setupFixtureRepository();

  const createClaim = (sha: string): ClaimedRef => ({
    message: {
      claimedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
      entry: ENTRY,
      load: "",
      machine: HOLDER.machine,
      renewedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
      worker: HOLDER.worker,
    },
    sha,
  });

  // The fleet's git calls run against the fixture origin, so the lease the delete carries is git's own check
  beforeEach(() => {
    runFleetRefGit.mockImplementation((args) => runGit(args, getCwd()));
  });

  test("deletes the claim it read, under a lease on that claim", () => {
    expect.hasAssertions();

    const claimSha = commitFile("a", "a");
    runGit(["push", "--quiet", REMOTE_NAME, `${claimSha}:${REF}`], getCwd());
    readClaimedRefs.mockReturnValue(new Map([[ENTRY, createClaim(claimSha)]]));

    releaseFleetEntry(ENTRY, HOLDER);

    expect(readRemoteSha(REF)).toBeUndefined();
    expect(removeHoldFile).toHaveBeenCalledExactlyOnceWith(ENTRY, HOLDER.worker);
  });

  test("refuses a claim another worker took over after it was read, and deletes nothing", () => {
    expect.hasAssertions();

    const readSha = commitFile("a", "a");
    const takenSha = commitFile("b", "b");
    runGit(["push", "--quiet", REMOTE_NAME, `${takenSha}:${REF}`], getCwd());
    readClaimedRefs.mockReturnValue(new Map([[ENTRY, createClaim(readSha)]]));

    expect(() => {
      releaseFleetEntry(ENTRY, HOLDER);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Delete, name: first, its claim moved while it was released, so nothing was deleted: release it again]`,
    );
    expect(readRemoteSha(REF)).toBe(takenSha);
    expect(removeHoldFile).not.toHaveBeenCalled();
  });
});
