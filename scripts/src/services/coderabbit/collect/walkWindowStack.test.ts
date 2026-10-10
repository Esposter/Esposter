import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import {
  CHECK_NAME,
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  MISSING_CHECK_WAIT_MS,
  PASS_BUCKET,
  QUEUE_BRANCH,
  REVIEW_ASK_MARKER,
  REVIEW_ASK_WAITS_MS,
  WINDOW_RECUT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { walkWindowStack } from "#src/services/coderabbit/collect/walkWindowStack";
import { PROBE_COMMENT, REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readCheckStatus, runGh } = vi.hoisted(() => ({
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runGh: vi.fn<typeof baseRunGh>(),
}));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(walkWindowStack, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const baseInput = { collectorSha: "", developSha: "", isDryRun: false, queueSha: "", viewerLogin };
  const askBody = `${PROBE_COMMENT}\n<!-- ${REVIEW_ASK_MARKER} -->`;
  const getWindow = (number: number, baseRefName: string, headRefOid = ""): WindowPullRequest => ({
    baseRefName,
    createdAt: new Date(0).toISOString(),
    headRefName: getWindowBranch(number),
    headRefOid,
    number,
    state: WindowPullRequestState.Open,
  });
  // What `gh` answers: the windows on every list, the bottom window's comments, and one page of nothing for every other
  // List. Each close records where `develop` stood on the remote when it was made
  const answerGh = (windows: WindowPullRequest[], bottomComments: GitHubEntry[]): string[] => {
    const closedOverDevelopShas: string[] = [];
    runGh.mockImplementation((args) => {
      if (args[0] === "pr" && args[1] === "list") return JSON.stringify(windows);
      else if (args[0] === "pr" && args[1] === "close") closedOverDevelopShas.push(readSha(`origin/${DEVELOP_BRANCH}`));
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/issues/${takeOne(windows).number}/comments`))
        return JSON.stringify([bottomComments]);
      else if (args.includes("--paginate")) return "[[]]";
      return "";
    });
    return closedOverDevelopShas;
  };
  const getPrCalls = (subcommands: string[]) =>
    runGh.mock.calls.filter(([args]) => args[0] === "pr" && subcommands.includes(args[1] ?? ""));

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A window the bot keeps skipping is too big for one review, so it and the window above it are cut again from a
  // `develop` moved back below them, and the walk ends without failing for the opener to cut the replacement
  test("re-cuts a bottom window still skipped past its last ask's wait and returns without failing", async () => {
    expect.hasAssertions();

    const mainSha = readSha("HEAD");
    const bottom = getWindow(0, MAIN_BRANCH, publish(getWindowBranch(0), commitFile(`${TEST_FILENAME}.ts`, "")));
    const above = getWindow(
      1,
      bottom.headRefName,
      publish(getWindowBranch(1), commitFile(`${TEST_FILENAME}/${TEST_FILENAME}.ts`, "")),
    );
    publish(DEVELOP_BRANCH, above.headRefOid);
    publish(QUEUE_BRANCH, above.headRefOid);
    const ask: GitHubEntry = {
      body: askBody,
      id: 0,
      updated_at: new Date(0).toISOString(),
      user: { login: viewerLogin },
    };
    readCheckStatus.mockReturnValue({ bucket: PASS_BUCKET, description: "", name: CHECK_NAME });
    const closedOverDevelopShas = answerGh([bottom, above], [ask, ask, ask]);
    vi.setSystemTime(takeOne(REVIEW_ASK_WAITS_MS, 2));

    const fileCap = Math.floor(REVIEW_FILE_CAP / 2);
    const reason = `the bot skipped the review of pull request #${bottom.number} past the collector's last ask (the bot ran no review — ${PASS_BUCKET} / ), so the window is too big for one review`;
    const body = `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->\nCut again under a cap of ${fileCap} files: ${reason}.`;

    await expect(walkWindowStack({ ...baseInput, cwd: getCwd(), stack: [bottom, above] })).resolves.toStrictEqual({
      blockReasons: [`#${bottom.number}, #${above.number} cut again under a cap of ${fileCap} files — ${reason}`],
      drainedPullRequests: [],
      retriggerDelaySeconds: undefined,
    });
    expect(getPrCalls(["comment", "close"])).toStrictEqual([
      [["pr", "comment", above.number.toString(), "--body", body]],
      [["pr", "close", above.number.toString(), "--delete-branch"]],
      [["pr", "comment", bottom.number.toString(), "--body", body]],
      [["pr", "close", bottom.number.toString(), "--delete-branch"]],
    ]);
    expect(closedOverDevelopShas).toStrictEqual([mainSha, mainSha]);
  });

  test("waits on a bottom window with no check until the missing-check wait has passed", async () => {
    expect.hasAssertions();

    const bottom = getWindow(0, MAIN_BRANCH);
    readCheckStatus.mockReturnValue(undefined);
    answerGh([bottom], []);

    await expect(walkWindowStack({ ...baseInput, cwd: getCwd(), stack: [bottom] })).resolves.toStrictEqual({
      blockReasons: [
        `pull request #${bottom.number} — no CodeRabbit check yet; asked for once it has waited until ${new Date(MISSING_CHECK_WAIT_MS).toISOString()}`,
      ],
      drainedPullRequests: [],
      retriggerDelaySeconds: getRetriggerDelaySeconds(MISSING_CHECK_WAIT_MS),
    });
    expect(getPrCalls(["comment"])).toStrictEqual([]);
  });

  test("asks for a bottom window's missing check once the wait has passed", async () => {
    expect.hasAssertions();

    const bottom = getWindow(0, MAIN_BRANCH);
    readCheckStatus.mockReturnValue(undefined);
    answerGh([bottom], []);
    vi.setSystemTime(MISSING_CHECK_WAIT_MS);

    await expect(walkWindowStack({ ...baseInput, cwd: getCwd(), stack: [bottom] })).resolves.toStrictEqual({
      blockReasons: [
        `pull request #${bottom.number} — asked 1 of ${REVIEW_ASK_WAITS_MS.length} times for the review the bot did not run — its answer fires the cycle again`,
      ],
      drainedPullRequests: [],
      retriggerDelaySeconds: getRetriggerDelaySeconds(takeOne(REVIEW_ASK_WAITS_MS, 0)),
    });
    expect(getPrCalls(["comment"])).toStrictEqual([[["pr", "comment", bottom.number.toString(), "--body", askBody]]]);
  });
});
