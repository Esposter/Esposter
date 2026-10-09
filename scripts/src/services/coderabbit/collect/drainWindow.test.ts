import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { replyPullRequestAnswers as baseReplyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";
import type { runDrainStep as baseRunDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";
import type { runGit as baseRunGit } from "#src/services/shared/runGit";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { MAIN_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { drainWindow } from "#src/services/coderabbit/collect/drainWindow";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { describe, expect, test, vi } from "vitest";

const { replyPullRequestAnswers, runDrainStep, runGh, runGit } = vi.hoisted(() => ({
  replyPullRequestAnswers: vi.fn<typeof baseReplyPullRequestAnswers>(),
  runDrainStep: vi.fn<typeof baseRunDrainStep>(),
  runGh: vi.fn<typeof baseRunGh>(),
  runGit: vi.fn<typeof baseRunGit>(),
}));

vi.mock(import("#src/services/coderabbit/collect/replyPullRequestAnswers"), () => ({
  replyPullRequestAnswers: replyPullRequestAnswers as unknown as typeof baseReplyPullRequestAnswers,
}));

vi.mock(import("#src/services/coderabbit/collect/runDrainStep"), () => ({
  runDrainStep: runDrainStep as unknown as typeof baseRunDrainStep,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

vi.mock(import("#src/services/shared/runGit"), () => ({ runGit: runGit as unknown as typeof baseRunGit }));

const getWindow = (number: number, state: WindowPullRequestState): WindowPullRequest => ({
  baseRefName: MAIN_BRANCH,
  createdAt: new Date(0).toISOString(),
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state,
});

describe(drainWindow, () => {
  const viewerLogin = "viewerLogin";

  // A window cut again after its review completed would otherwise have findings no drain ever reads
  test("drains the re-cut window below the merged one after it, on the fixes branch its drain left", async () => {
    expect.hasAssertions();

    const recutComment: GitHubEntry = {
      body: `<!-- ${WINDOW_RECUT_MARKER} cap:1 -->`,
      id: 0,
      updated_at: new Date(0).toISOString(),
      user: { login: viewerLogin },
    };
    runGit.mockReturnValue("");
    runGh.mockImplementation(([command, path = ""]) => {
      if (command === "pr")
        return JSON.stringify([
          getWindow(2, WindowPullRequestState.Merged),
          getWindow(1, WindowPullRequestState.Closed),
        ]);
      return JSON.stringify([path.startsWith("repos/{owner}/{repo}/issues/1/") ? [recutComment] : []]);
    });
    runDrainStep.mockImplementation(({ pullRequest }: DrainStepInput) =>
      Promise.resolve({ reviewFixesSha: pullRequest.toString() }),
    );

    await expect(
      drainWindow({
        collectorSha: "",
        cwd: "",
        developSha: "",
        isDryRun: false,
        mainSha: "",
        pullRequest: 2,
        queueSha: "",
        viewerLogin,
      }),
    ).resolves.toStrictEqual({ reviewFixesSha: "1" });
    expect(
      runDrainStep.mock.calls.map(([{ pullRequest, reviewFixesSha }]) => [pullRequest, reviewFixesSha]),
    ).toStrictEqual([
      [2, undefined],
      [1, "2"],
    ]);
    expect(replyPullRequestAnswers.mock.calls.map(([{ pullRequest }]) => pullRequest)).toStrictEqual([2, 1]);
  });
});
