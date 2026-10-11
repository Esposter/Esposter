import type { runFleetRefGit as baseRunFleetRefGit } from "#src/services/fleet/runFleetRefGit";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { describe, expect, test, vi } from "vitest";

const { runFleetRefGit } = vi.hoisted(() => ({ runFleetRefGit: vi.fn<typeof baseRunFleetRefGit>() }));

vi.mock(import("#src/services/fleet/runFleetRefGit"), () => ({ runFleetRefGit }));

// The push fails, and `git ls-remote` answers with where the remote holds the ref now
const failPush = (remoteSha: string) => {
  runFleetRefGit.mockImplementation(([command]) => {
    if (command === "push") throw new Error(" ");
    return remoteSha;
  });
};

describe(pushFleetRef, () => {
  const SHA = "a";
  const LEASE_SHA = "b";
  const OTHER_SHA = "c";

  // A push killed at its bound may have landed before its answer was lost, so where the ref is now is the outcome
  test.each([
    [FleetPushOutcome.Pushed, SHA],
    [FleetPushOutcome.Refused, OTHER_SHA],
    [FleetPushOutcome.Gone, ""],
  ] as const)("reads a failed push as %s while the remote holds %s", (outcome, remoteSha) => {
    expect.hasAssertions();

    failPush(remoteSha);

    expect(pushFleetRef("", SHA, LEASE_SHA)).toBe(outcome);
  });

  // A remote still holding the lease refused nothing, so a renewal that only timed out is retried rather than read as
  // Its claim moving
  test.each([
    [LEASE_SHA, LEASE_SHA],
    [undefined, ""],
  ] as const)(
    "throws the push's own error while the lease %s is what the remote holds, %s",
    (expectedSha, remoteSha) => {
      expect.hasAssertions();

      failPush(remoteSha);

      expect(() => pushFleetRef("", SHA, expectedSha)).toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    },
  );
});
