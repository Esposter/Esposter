import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  WINDOW_RECUT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { settleWindowChain } from "#src/services/coderabbit/collect/settleWindowChain";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

// The last argument of each `gh pr <subcommand>` call: the body a comment posts, the number a close names
const getPrArguments = (prSubcommand: string) =>
  runGh.mock.calls
    .filter(([[command, subcommand]]) => command === "pr" && subcommand === prSubcommand)
    .map(([args]) => args[2]);

describe(settleWindowChain, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  // Each window one commit over the head its base names, `develop` and the queue on the last one published
  const publishWindows = (bases: [number, string][]): WindowPullRequest[] => {
    const windows = bases.map(([number, baseRefName]) => ({
      baseRefName,
      createdAt: new Date(0).toISOString(),
      headRefName: getWindowBranch(number),
      headRefOid: publish(getWindowBranch(number), commitFile(`${TEST_FILENAME}/${number}`, "")),
      number,
      state: WindowPullRequestState.Open,
    }));
    const topSha = readSha("HEAD");
    publish(DEVELOP_BRANCH, topSha);
    publish(QUEUE_BRANCH, topSha);
    runGh.mockImplementation((args) => {
      if (args[0] === "pr" && args[1] === "list") return JSON.stringify(windows);
      else if (args.includes("--paginate")) return "[[]]";
      return "";
    });
    return windows;
  };

  // A gap is a window a person retargeted or reopened out of order: everything above it is cut again from the queue
  test("closes every window above a gap, top first, and moves develop back to the top of the chain", () => {
    expect.hasAssertions();

    const windows = publishWindows([
      [1, MAIN_BRANCH],
      [2, getWindowBranch(1)],
      [4, getWindowBranch(3)],
      [5, getWindowBranch(4)],
    ]);
    const { stack } = settleWindowChain({
      cwd: getCwd(),
      isDryRun: false,
      stackPullRequests: windows.toReversed(),
      viewerLogin,
    });

    expect(stack).toStrictEqual(windows.slice(0, 2));
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(takeOne(windows, 1).headRefOid);
    expect(getPrArguments("close")).toStrictEqual(["5", "4"]);
    expect(getPrArguments("comment")).toStrictEqual(["5", "4"]);
    expect(
      runGh.mock.calls.find(([[command, subcommand]]) => command === "pr" && subcommand === "comment")?.[0].at(-1),
    ).toBe(
      `<!-- ${WINDOW_RECUT_MARKER} cap:${REVIEW_FILE_CAP} -->\nCut again under a cap of ${REVIEW_FILE_CAP} files: the window stack forks or has a gap, and these windows are off its chain from ${MAIN_BRANCH}.`,
    );
  });

  // Two windows on `main` leave no chain at all, so `develop` returns to where it last met `main`
  test("closes both windows of a fork on main and moves develop back to main", () => {
    expect.hasAssertions();

    const mainSha = readSha(`origin/${MAIN_BRANCH}`);
    const windows = publishWindows([
      [1, MAIN_BRANCH],
      [2, MAIN_BRANCH],
    ]);
    const { stack } = settleWindowChain({ cwd: getCwd(), isDryRun: false, stackPullRequests: windows, viewerLogin });

    expect(stack).toStrictEqual([]);
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(mainSha);
    expect(getPrArguments("close")).toStrictEqual(["2", "1"]);
  });
});
