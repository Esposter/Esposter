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
  RELANDED_TRAILER,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { relandHeldCommits } from "#src/services/coderabbit/collect/relandHeldCommits";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The resolver is a session and every comment and issue goes through `gh`; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(relandHeldCommits, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const issueNumber = 1;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}`;
  const relandInput = { collectorSha, isDryRun: false, viewerLogin };
  // The held commit's own comments as GitHub keeps them, so a run reads back the heads an earlier one recorded, and the
  // One issue the park opened
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
          updated_at: "",
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
    expect(
      runGh.mock.calls.filter(([[command, subcommand]]) => command === "issue" && subcommand === "close"),
    ).toStrictEqual([
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

  // A failure keeps the commit held, recorded at the head it was tried at, so only the next head spends a session on it
  test("keeps a held commit whose conflict the resolver left, and tries it once per main head", async () => {
    expect.hasAssertions();

    const { comments, heldBranch, heldSha, mainSha, moveMain, queueSha } = setupHeldCommit(" ", TEST_FILENAME);
    runSession.mockResolvedValue({ isEnded: true });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const movedMainSha = moveMain();
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });

    expect(runSession).toHaveBeenCalledTimes(2);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(readHeldBranches()).toBe(`${heldSha}\trefs/heads/${heldBranch}\n`);
    expect(comments.map(({ body }) => body)).toStrictEqual([
      `${getMarker(RELAND_MARKER, heldSha)}\nHeld while \`${MAIN_BRANCH}\` is at ${mainSha}: the collector tries its re-land on its next run, and again each time \`${MAIN_BRANCH}\` moves.`,
      `${getMarker(RELAND_MARKER, heldSha, [mainSha])}\nTried at \`${MAIN_BRANCH}\` ${mainSha} — the session left the pick unresolved; the next head tries again.`,
      `${getMarker(RELAND_FAILED_MARKER, heldSha, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to re-land ${heldSha} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha} failed. See the collector run.`,
      `${getMarker(RELAND_MARKER, heldSha, [movedMainSha])}\nTried at \`${MAIN_BRANCH}\` ${movedMainSha} — the session left the pick unresolved; the next head tries again.`,
      `${getMarker(RELAND_FAILED_MARKER, heldSha, [collectorSha])}\nAttempt 2 of ${SESSION_ATTEMPT_CAP} to re-land ${heldSha} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${movedMainSha} failed. See the collector run.`,
    ]);
  });

  // A claim the express lane parked in a quiet queue is still the queue's own commit: picked onto the queue it would
  // Come back as the claim no cut applied, so it waits for the rewrite that drops it
  test("leaves a held commit the queue still holds itself", async () => {
    expect.hasAssertions();

    publish(DEVELOP_BRANCH, `origin/${MAIN_BRANCH}`);
    const heldSha = publish(QUEUE_BRANCH, commitFile(TEST_FILENAME, ""));
    const heldBranch = getHeldBranch(heldSha);
    publish(heldBranch, heldSha);
    answerGh(heldSha, heldBranch);
    await relandHeldCommits({ ...relandInput, cwd: getCwd() });
    const relandRun = await relandHeldCommits({ ...relandInput, cwd: getCwd() });

    expect(relandRun).toStrictEqual({ retriggerDelaySeconds: undefined });
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(heldSha);
    expect(readHeldBranches()).toBe(`${heldSha}\trefs/heads/${heldBranch}\n`);
  });
});
