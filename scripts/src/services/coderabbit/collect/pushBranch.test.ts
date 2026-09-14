import type { runGit as baseRunGit } from "#src/services/coderabbit/shared/runGit";

import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { runGit } = vi.hoisted(() => ({ runGit: vi.fn<typeof baseRunGit>() }));

vi.mock(import("#src/services/coderabbit/shared/runGit"), () => ({ runGit }));

describe(pushBranch, () => {
  const BRANCH = "develop";
  const EXPECTED_SHA = "1".repeat(40);
  const MOVED_SHA = "2".repeat(40);
  const TARGET_SHA = "3".repeat(40);
  // Whatever git failed for, `runGit` hands it back the same way — which is why the rejection text is never what
  // Decides the outcome
  const GIT_FAILURE = new InvalidOperationError(Operation.Update, "git", "the remote said no");

  // The stub answers the four commands the push runs. `remoteShas` is read one entry per `rev-parse`, so a branch
  // That moves under an in-flight push is the pair whose second entry differs.
  const stubGit = ({
    isPushRejected = false,
    isTargetDescended = true,
    remoteShas,
  }: {
    isPushRejected?: boolean;
    isTargetDescended?: boolean;
    remoteShas: string[];
  }): void => {
    const shas = [...remoteShas];
    runGit.mockImplementation(([command]) => {
      if (command === "rev-parse") return `${shas.shift() ?? ""}\n`;
      else if (command === "merge-base" && !isTargetDescended) throw GIT_FAILURE;
      else if (command === "push" && isPushRejected) throw GIT_FAILURE;
      return "";
    });
  };
  const getPushArguments = (): string[][] =>
    runGit.mock.calls.map(([args]) => args).filter(([command]) => command === "push");

  beforeEach(() => {
    runGit.mockReset();
  });

  // The swap is the push rather than the read before it: the lease carries the sha every count was measured from,
  // So a branch that moves in the gap is refused by the remote instead of landing between the two commands
  test("leases the sha every count was measured from to the remote", () => {
    expect.hasAssertions();

    stubGit({ remoteShas: [EXPECTED_SHA] });
    const isPushed = pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: false, sha: TARGET_SHA });

    expect(isPushed).toBe(true);
    expect(getPushArguments()).toStrictEqual([
      [
        "push",
        `--force-with-lease=refs/heads/${BRANCH}:${EXPECTED_SHA}`,
        "origin",
        `${TARGET_SHA}:refs/heads/${BRANCH}`,
      ],
    ]);
  });

  // A concurrent update is the ordinary case the cycle is built to re-measure against, so it is an outcome the run
  // Reports rather than an exception that fails the job
  test("reports a branch that moved while the push was in flight", () => {
    expect.hasAssertions();

    stubGit({ isPushRejected: true, remoteShas: [EXPECTED_SHA, MOVED_SHA] });
    const isPushed = pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: false, sha: TARGET_SHA });

    expect(isPushed).toBe(false);
  });

  // The crossing case for the one above: a rejection is only a lost lease when the ref actually moved, so a push
  // That failed with the branch still where it was — no network, no credential — reaches the job log as itself
  test("fails the run when a rejected push left the branch where it was", () => {
    expect.hasAssertions();

    stubGit({ isPushRejected: true, remoteShas: [EXPECTED_SHA, EXPECTED_SHA] });

    expect(() =>
      pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: false, sha: TARGET_SHA }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: git, the remote said no]`,
    );
  });

  // The lease makes the push forced, so this is the guard standing in for the non-fast-forward git used to refuse
  // On its own — and it stops before the push rather than after it
  test("refuses a target that is not a descendant of the sha it was built on", () => {
    expect.hasAssertions();

    stubGit({ isTargetDescended: false, remoteShas: [EXPECTED_SHA] });

    expect(() =>
      pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: false, sha: TARGET_SHA }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, 3333333333333333333333333333333333333333 is not a descendant of develop at 1111111111111111111111111111111111111111]`,
    );
    expect(getPushArguments()).toStrictEqual([]);
  });

  // The early exit: a branch already known to be stale is not worth a push that would be refused anyway
  test("pushes nothing when the branch moved before the run reached the push", () => {
    expect.hasAssertions();

    stubGit({ remoteShas: [MOVED_SHA] });
    const isPushed = pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: false, sha: TARGET_SHA });

    expect(isPushed).toBe(false);
    expect(getPushArguments()).toStrictEqual([]);
  });

  // The whole of what a dry run withholds is this one command
  test("withholds the push on a dry run and reports what it would have done", () => {
    expect.hasAssertions();

    stubGit({ remoteShas: [EXPECTED_SHA] });
    const isPushed = pushBranch({ branch: BRANCH, expectedSha: EXPECTED_SHA, isDryRun: true, sha: TARGET_SHA });

    expect(isPushed).toBe(true);
    expect(getPushArguments()).toStrictEqual([]);
  });
});
