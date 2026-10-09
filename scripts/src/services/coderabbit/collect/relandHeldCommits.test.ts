import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RELAND_FAILED_MARKER,
  RELAND_MARKER,
  RELAND_RETRY_WAITS_MS,
  RELANDED_TRAILER,
  RETRIGGER_BUFFER_MS,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { relandHeldCommits } from "#src/services/coderabbit/collect/relandHeldCommits";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The resolver is a session and every comment and issue goes through `gh`; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const readIssueCloses = () =>
  runGh.mock.calls.filter(([[command, subcommand]]) => command === "issue" && subcommand === "close");
const getSeenComment = (heldSha: string, mainSha: string): string =>
  `${getMarker(RELAND_MARKER, heldSha)}\nHeld while \`${MAIN_BRANCH}\` is at ${mainSha}: the collector tries its re-land on its next run, then each time \`${MAIN_BRANCH}\` moves or the wait after a failed try passes, up to ${SESSION_ATTEMPT_CAP} tries.`;
const getTriedComment = (heldSha: string, mainSha: string, retryAtMs: number): string =>
  `${getMarker(RELAND_MARKER, heldSha, [mainSha])}\nTried at \`${MAIN_BRANCH}\` ${mainSha} — the session left the pick unresolved; the next head tries again, and this one at ${new Date(retryAtMs).toISOString()}.`;

describe(relandHeldCommits, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const issueNumber = 1;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}`;
  const relandInput = { collectorSha, isDryRun: false, viewerLogin };
  const firstWaitMs = takeOne(RELAND_RETRY_WAITS_MS);
  const secondWaitMs = takeOne(RELAND_RETRY_WAITS_MS, 1);
  // The held commit's own comments as GitHub keeps them, stamped by the clock, so a run reads back the heads and the
  // Tries an earlier one recorded, and the one issue the park opened
  const answerGh = (heldSha: string, heldBranch: string): GitHubEntry[] => {
    const comments: GitHubEntry[] = [];
    runGh.mockImplementation(([command, subcommand, flag, field = ""]) => {
      if (command === "issue" && subcommand === "list")
        return JSON.stringify([{ body: `- ${heldSha}, held on \`${heldBranch}\``, number: issueNumber }]);
      else if (command === "pr") return "[]";
      else if (flag === "-f") {
        comments.push({
          body: field.slice("body=".length),
          id: comments.length,
          updated_at: new Date().toISOString(),
          user: { login: viewerLogin },
        });
        return "";
      }
      return JSON.stringify([comments]);
    });
    return comments;
  };
  const setupHeldCommit = (queueContent: string, heldContent: string) => {
    const mainSha = readSha(`origin/${MAIN_BRANCH}`);
    const queueSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, queueContent));
    publish(DEVELOP_BRANCH, queueSha);
    switchTo(mainSha);
    const heldSha = commitFile(TEST_FILENAME, heldContent);
    const heldBranch = getHeldBranch(heldSha);
    publish(heldBranch, heldSha);
    const comments = answerGh(heldSha, heldBranch);
    // `main` moves past the head the commit was parked at
    const moveMain = (): string => {
      switchTo(mainSha);
      return publish(MAIN_BRANCH, commitFile(nestedPath, ""));
    };
    return { comments, heldBranch, heldSha, mainSha, moveMain, queueSha };
  };
  const readHeldBranches = (): string => runGit(["ls-remote", "origin", "refs/heads/ai/held/*"], getCwd());
  const getFailureComment = (heldSha: string, mainSha: string, attempt: number): string =>
    `${getMarker(RELAND_FAILED_MARKER, heldSha, [collectorSha])}\nAttempt ${attempt} of ${SESSION_ATTEMPT_CAP} to re-land ${heldSha} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha} failed. See the collector run.`;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The run that first finds a commit held only records it and wakes the next, which tries the re-land at that head: in
  // A quiet queue `main` may not move again for hours
  test("re-lands a held commit on the run after the one that first found it held, at the same main head", async () => {
    expect.hasAssertions();

    const { heldSha, queueSha } = setupHeldCommit("", " ");
    const seenRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const unmovedQueueSha = readSha(`origin/${QUEUE_BRANCH}`);
    const relandRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const relandedSha = readSha(`origin/${QUEUE_BRANCH}`);

    expect([seenRun, relandRun]).toStrictEqual([
      { retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS },
      { retriggerDelaySeconds: undefined },
    ]);
    expect(unmovedQueueSha).toBe(queueSha);
    expect(readSha(`${relandedSha}^`)).toBe(queueSha);
    expect(runGit(["show", `${relandedSha}:${TEST_FILENAME}`], getCwd())).toBe(" ");
    expect(runGit(["log", "-1", "--format=%B", relandedSha], getCwd())).toBe(
      `${TEST_FILENAME}\n\n${RELANDED_TRAILER}: ${heldSha}\n\n`,
    );
    expect(readHeldBranches()).toBe("");
    expect(readIssueCloses()).toStrictEqual([
      [
        [
          "issue",
          "close",
          issueNumber.toString(),
          "--comment",
          `${heldSha} was re-landed onto \`${QUEUE_BRANCH}\` as ${relandedSha}`,
        ],
      ],
    ]);
    expect(runSession).not.toHaveBeenCalled();
  });

  // A failure keeps the commit held, recorded at the head it was tried at, and a head `main` moves to is tried at once,
  // Inside the wait the one before it set
  test("keeps a held commit whose conflict the resolver left, and tries it again at once at a new main head", async () => {
    expect.hasAssertions();

    const { comments, heldBranch, heldSha, mainSha, moveMain, queueSha } = setupHeldCommit(" ", TEST_FILENAME);
    runSession.mockResolvedValue({ isEnded: true });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const waitingRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const movedMainSha = moveMain();
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });

    expect(waitingRun).toStrictEqual({
      retriggerDelaySeconds: getRetriggerDelaySeconds(firstWaitMs + RETRIGGER_BUFFER_MS),
    });
    expect(runSession).toHaveBeenCalledTimes(2);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(readHeldBranches()).toBe(`${heldSha}\trefs/heads/${heldBranch}\n`);
    expect(comments.map(({ body }) => body)).toStrictEqual([
      getSeenComment(heldSha, mainSha),
      getTriedComment(heldSha, mainSha, firstWaitMs),
      getFailureComment(heldSha, mainSha, 1),
      getTriedComment(heldSha, movedMainSha, secondWaitMs),
      getFailureComment(heldSha, movedMainSha, 2),
    ]);
  });

  // `main` may not move for hours, so a head already tried is tried again once the wait after its last try passes, and
  // The attempts run out with `main` still: past them the commit stays held with its issue
  test("tries a failed re-land again at an unmoved main head after each wait, up to the cap", async () => {
    expect.hasAssertions();

    const { heldBranch, heldSha } = setupHeldCommit(" ", TEST_FILENAME);
    runSession.mockResolvedValue({ isEnded: true });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const firstRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    vi.setSystemTime(firstWaitMs - 1);
    const waitingRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    vi.setSystemTime(firstWaitMs);
    const secondRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    vi.setSystemTime(firstWaitMs + secondWaitMs);
    const thirdRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    vi.setSystemTime(firstWaitMs + 2 * secondWaitMs);
    const cappedRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });

    expect([firstRun, waitingRun, secondRun, thirdRun, cappedRun]).toStrictEqual([
      { retriggerDelaySeconds: getRetriggerDelaySeconds(firstWaitMs + RETRIGGER_BUFFER_MS) },
      { retriggerDelaySeconds: getRetriggerDelaySeconds(1 + RETRIGGER_BUFFER_MS) },
      { retriggerDelaySeconds: getRetriggerDelaySeconds(secondWaitMs + RETRIGGER_BUFFER_MS) },
      { retriggerDelaySeconds: undefined },
      { retriggerDelaySeconds: undefined },
    ]);
    expect(runSession).toHaveBeenCalledTimes(SESSION_ATTEMPT_CAP);
    expect(readHeldBranches()).toBe(`${heldSha}\trefs/heads/${heldBranch}\n`);
    expect(readIssueCloses()).toStrictEqual([]);
  });

  // A commit its own branch still carries — a claim the express lane parked in a quiet queue, the port's leftover, a fix
  // `ai/review-fixes` holds — would come back from a pick as the commit that was parked, so it leaves the held set and
  // The paths that parked it try it again; one they park again waits out its try like a failed pick
  test.each([QUEUE_BRANCH, REVIEW_FIXES_BRANCH])(
    "lets go of a held commit %s still carries, and waits after a park that brings it back",
    async (carryingBranch) => {
      expect.hasAssertions();

      const mainSha = publish(DEVELOP_BRANCH, `origin/${MAIN_BRANCH}`);
      publish(QUEUE_BRANCH, mainSha);
      const heldSha = publish(carryingBranch, commitFile(TEST_FILENAME, ""));
      const heldBranch = getHeldBranch(heldSha);
      publish(heldBranch, heldSha);
      const comments = answerGh(heldSha, heldBranch);
      await relandHeldCommits({ ...relandInput, cwd: getCwd() });
      const returnRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });
      const returnedBranches = readHeldBranches();
      publish(heldBranch, heldSha);
      const parkedAgainRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });

      expect([returnRun, parkedAgainRun]).toStrictEqual([
        { retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS },
        { retriggerDelaySeconds: getRetriggerDelaySeconds(firstWaitMs + RETRIGGER_BUFFER_MS) },
      ]);
      expect(returnedBranches).toBe("");
      expect(readSha(`origin/${carryingBranch}`)).toBe(heldSha);
      expect(comments.map(({ body }) => body)).toStrictEqual([
        getSeenComment(heldSha, mainSha),
        `${getMarker(RELAND_MARKER, heldSha, [mainSha])}\nLet go at \`${MAIN_BRANCH}\` ${mainSha}, since \`${QUEUE_BRANCH}\` or \`${REVIEW_FIXES_BRANCH}\` still carries it: the paths that parked it try it again under their own caps.`,
        `${getMarker(RELAND_FAILED_MARKER, heldSha, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP}: let go of ${heldSha} at ${MAIN_BRANCH} ${mainSha}, for the paths that parked it to try again`,
      ]);
      expect(readIssueCloses()).toStrictEqual([
        [
          [
            "issue",
            "close",
            issueNumber.toString(),
            "--comment",
            `${heldSha} is owed again at \`${MAIN_BRANCH}\` ${mainSha}: the paths that parked it try it again`,
          ],
        ],
      ]);
      expect(runSession).not.toHaveBeenCalled();
    },
  );
});
