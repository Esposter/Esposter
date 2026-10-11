import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  DEVELOP_BRANCH,
  FOLD_FAILED_MARKER,
  HELD_BRANCH_PREFIX,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { foldWindowMain } from "#src/services/coderabbit/collect/foldWindowMain";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The resolver is a session and every pull request, issue and attempt marker goes through `gh`; git runs for real
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(foldWindowMain, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, deleteFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;

  // Past the fold's cap no session can settle the conflict, so the commit causing it is taken out of the window's way
  // And the rest is cut again, rather than the run failing until a person merges `main` into the window
  test("parks the commit a window conflicts with main on past the fold's cap and cuts the window again", async () => {
    expect.hasAssertions();

    const baseSha = commitFile(filePath, "");
    const mainSha = publish(MAIN_BRANCH, commitFile(filePath, " "));
    switchTo(baseSha);
    commitFile(nestedPath, "");
    const conflictingSha = deleteFile(filePath);
    const window: WindowPullRequest = {
      baseRefName: MAIN_BRANCH,
      createdAt: new Date(0).toISOString(),
      headRefName: getWindowBranch(0),
      headRefOid: publish(getWindowBranch(0), conflictingSha),
      number: 0,
      state: WindowPullRequestState.Open,
    };
    publish(DEVELOP_BRANCH, conflictingSha);
    publish(QUEUE_BRANCH, conflictingSha);
    const foldFailedComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: getMarker(FOLD_FAILED_MARKER, mainSha, [collectorSha]),
      id,
      updated_at: new Date(0).toISOString(),
      user: { login: viewerLogin },
    }));
    runGh.mockImplementation((args) => {
      if (args[0] === "pr" && args[1] === "list") return JSON.stringify([window]);
      else if (args[0] === "issue" && args[1] === "list") return "[]";
      else if (args[1]?.startsWith(`repos/{owner}/{repo}/commits/${mainSha}/comments`))
        return JSON.stringify([foldFailedComments]);
      else if (args.includes("--paginate")) return "[[]]";
      return "";
    });

    await expect(
      foldWindowMain({
        collectorSha,
        cwd: getCwd(),
        headSha: conflictingSha,
        isDryRun: false,
        mainSha,
        viewerLogin,
        window,
      }),
    ).resolves.toStrictEqual({
      kind: CycleOutcomeKind.Idle,
      reason: `#${window.number} cut again under a cap of ${REVIEW_FILE_CAP} files — pull request #${window.number} conflicts with ${MAIN_BRANCH} at ${mainSha} past the resolver's attempts, so the commits it conflicts on are parked and the rest are cut again`,
      retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
    });
    expect(runGit(["ls-remote", "origin", `refs/heads/${HELD_BRANCH_PREFIX}*`], getCwd())).toBe(
      `${conflictingSha}\trefs/heads/${getHeldBranch(conflictingSha)}\n`,
    );
    expect(readSha(`origin/${DEVELOP_BRANCH}`)).toBe(baseSha);
    expect(runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "close")).toStrictEqual([
      [["pr", "close", window.number.toString(), "--delete-branch"]],
    ]);
    expect(runSession).not.toHaveBeenCalled();
  });
});
