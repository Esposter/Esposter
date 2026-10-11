import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

// The attempts and the issue a park opens go out through `gh`; git runs for real against the fixture
vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getIssueCreates = () =>
  runGh.mock.calls.filter(([[command, subcommand]]) => command === "issue" && subcommand === "create");

describe(runExpressLane, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  // The claimed commit's own comments as GitHub keeps them, so a run reads back the attempts an earlier one posted,
  // And no issue open before a park opens one
  const answerGh = (comments: GitHubEntry[]): void => {
    runGh.mockImplementation(([command, , flag, field = ""]) => {
      if (command === "issue") return "[]";
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
  };
  // A claimed commit built on a file `main` lacks, which no cut onto `main` can apply
  const setupUnappliedClaim = () => {
    const mainSha = publish(MAIN_BRANCH, "HEAD");
    const developSha = commitFile(TEST_FILENAME, "");
    commitFile(TEST_FILENAME, " ");
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    const claimedSha = readSha("HEAD");
    return {
      claimedSha,
      input: { collectorSha, cwd: getCwd(), developSha, isDryRun: false, mainSha, queueSha: claimedSha, viewerLogin },
      mainSha,
    };
  };

  // A pick onto the same head is the same pick, so only a head that moved past the commit is another attempt
  test("counts a claimed commit that does not apply once per main head", () => {
    expect.hasAssertions();

    const { claimedSha, input, mainSha } = setupUnappliedClaim();
    const comments: GitHubEntry[] = [];
    answerGh(comments);
    const firstLane = runExpressLane(input);
    const repeatedLane = runExpressLane(input);
    switchTo(mainSha);
    const movedMainSha = publish(MAIN_BRANCH, commitFile(nestedPath, ""));
    const movedLane = runExpressLane({ ...input, mainSha: movedMainSha });
    const marker = getMarker(EXPRESS_FAILED_MARKER, claimedSha, [collectorSha]);

    expect([firstLane, repeatedLane, movedLane]).toStrictEqual([
      { heldShas: [claimedSha] },
      { heldShas: [claimedSha] },
      { heldShas: [claimedSha] },
    ]);
    expect(comments.map(({ body }) => body)).toStrictEqual([
      `${marker}\nAttempt 1 of ${SESSION_ATTEMPT_CAP} to cut onto ${MAIN_BRANCH} at ${mainSha} failed. See the collector run.`,
      `${marker}\nAttempt 2 of ${SESSION_ATTEMPT_CAP} to cut onto ${MAIN_BRANCH} at ${movedMainSha} failed. See the collector run.`,
    ]);
  });

  // Parked, the commit is owed nowhere, so the lane holds nothing on it and the next run never meets it again
  test("parks a claimed commit past the attempt cap and moves on without it", () => {
    expect.hasAssertions();

    const { claimedSha, input, mainSha } = setupUnappliedClaim();
    const comments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: getMarker(EXPRESS_FAILED_MARKER, claimedSha, [collectorSha]),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    answerGh(comments);
    const parkingLane = runExpressLane(input);
    const nextLane = runExpressLane(input);

    expect([parkingLane, nextLane]).toStrictEqual([{ heldShas: [] }, { heldShas: [] }]);
    expect(readSha(`origin/${getHeldBranch(claimedSha)}`)).toBe(claimedSha);
    expect(readSha(`origin/${MAIN_BRANCH}`)).toBe(mainSha);
    expect(comments).toHaveLength(SESSION_ATTEMPT_CAP);
    expect(getIssueCreates()).toMatchInlineSnapshot(`
      [
        [
          [
            "issue",
            "create",
            "--title",
            "Held: a (1 commit)",
            "--label",
            "ready-for-agent",
            "--body",
            "<!-- review-collector held commit:d6994c347543f6c7b83c12786e5d667ec5517612 -->
      no cut onto main applied them across 3 of its heads — re-land each without its \`Express:\` trailer, so a window carries it in queue order

      - d6994c347543f6c7b83c12786e5d667ec5517612 a, held on \`ai/held/d6994c3475\`

      To re-land them, on \`ai/queue\`:

      1. \`git fetch origin\`
      2. For each held branch above, in order: \`git cherry-pick --no-commit origin/<branch>\`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, \`git commit -m "<subject>"\` — never the message the pick prepares, nor \`-x\`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted
      3. \`pnpm ai:queue:push\`, after which each new commit ports like any other
      4. \`git push origin --delete <branch>\` for each held branch, then close this issue",
          ],
        ],
      ]
    `);
  });
});
