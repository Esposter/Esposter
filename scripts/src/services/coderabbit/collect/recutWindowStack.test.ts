import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  WINDOW_RECUT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { recutWindowStack } from "#src/services/coderabbit/collect/recutWindowStack";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(recutWindowStack, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, installPreReceiveHook, publish, readSha } = setupFixtureRepository();
  const fileCap = 1;
  const reason = "";
  // Three windows stacked on `main`, each one commit over the one below, with `develop` and the queue on the top one
  const setupStack = (): { bottom: WindowPullRequest; middle: WindowPullRequest; top: WindowPullRequest } => {
    const publishWindow = (number: number, baseRefName: string): WindowPullRequest => ({
      baseRefName,
      createdAt: new Date(0).toISOString(),
      headRefName: getWindowBranch(number),
      headRefOid: publish(getWindowBranch(number), commitFile(`${TEST_FILENAME}/${number}`, "")),
      number,
      state: WindowPullRequestState.Open,
    });
    const bottom = publishWindow(0, MAIN_BRANCH);
    const middle = publishWindow(1, bottom.headRefName);
    const top = publishWindow(2, middle.headRefName);
    publish(DEVELOP_BRANCH, top.headRefOid);
    publish(QUEUE_BRANCH, top.headRefOid);
    runGh.mockImplementation((args) =>
      args[0] === "pr" && args[1] === "list" ? JSON.stringify([bottom, middle, top]) : "",
    );
    return { bottom, middle, top };
  };
  const getPrCalls = () =>
    runGh.mock.calls.filter(([args]) => args[0] === "pr" && (args[1] === "comment" || args[1] === "close"));

  test("returns develop to the window below and closes the window with every one above it, top first", () => {
    expect.hasAssertions();

    const { bottom, middle, top } = setupStack();
    const body = `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->\nCut again under a cap of ${fileCap} files: ${reason}.`;

    expect(recutWindowStack({ cwd: getCwd(), fileCap, isDryRun: false, reason, window: middle })).toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `#${middle.number}, #${top.number} cut again under a cap of ${fileCap} files — ${reason}`,
    });
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(bottom.headRefOid);
    expect(getPrCalls()).toStrictEqual([
      [["pr", "comment", top.number.toString(), "--body", body]],
      [["pr", "close", top.number.toString(), "--delete-branch"]],
      [["pr", "comment", middle.number.toString(), "--body", body]],
      [["pr", "close", middle.number.toString(), "--delete-branch"]],
    ]);
  });

  // A window closed over a `develop` that still carries it would be cut again by nothing
  test("closes nothing when develop moved under its lease", () => {
    expect.hasAssertions();

    const { middle } = setupStack();
    installPreReceiveHook(
      `env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${DEVELOP_BRANCH} ${readSha(`origin/${MAIN_BRANCH}`)}`,
    );

    expect(recutWindowStack({ cwd: getCwd(), fileCap, isDryRun: false, reason, window: middle })).toStrictEqual(
      getMovedOutcome(DEVELOP_BRANCH),
    );
    expect(getPrCalls()).toStrictEqual([]);
  });
});
