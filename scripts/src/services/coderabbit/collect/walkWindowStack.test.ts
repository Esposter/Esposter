import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { readCheckStatus as baseReadCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { CHECK_NAME, MAIN_BRANCH, PASS_BUCKET } from "#src/services/coderabbit/collect/constants";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { walkWindowStack } from "#src/services/coderabbit/collect/walkWindowStack";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { readCheckStatus, runGh } = vi.hoisted(() => ({
  readCheckStatus: vi.fn<typeof baseReadCheckStatus>(),
  runGh: vi.fn<typeof baseRunGh>(),
}));

vi.mock(import("#src/services/coderabbit/collect/readCheckStatus"), () => ({
  readCheckStatus: readCheckStatus as unknown as typeof baseReadCheckStatus,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getWindow = (number: number, baseRefName: string): WindowPullRequest => ({
  baseRefName,
  createdAt: "",
  headRefName: getWindowBranch(number),
  headRefOid: "",
  number,
  state: WindowPullRequestState.Open,
});

describe(walkWindowStack, () => {
  const viewerLogin = "viewerLogin";

  // A bottom window the bot skipped again after its ask is a person's, and the red waits for the walk: the window
  // Above it is still asked for the review it skipped, or the stack would stall on the one ask nobody posted
  test("asks for the review skipped above a bottom window skipped again after its ask, then fails the run", async () => {
    expect.hasAssertions();

    const bottom = getWindow(0, MAIN_BRANCH);
    const above = getWindow(1, getWindowBranch(bottom.number));
    const ask: GitHubEntry = { body: PROBE_COMMENT, id: 0, updated_at: "", user: { login: viewerLogin } };
    readCheckStatus.mockReturnValue({ bucket: PASS_BUCKET, description: "Review skipped", name: CHECK_NAME });
    runGh.mockImplementation((args) => {
      if (args[1]?.startsWith(`repos/{owner}/{repo}/issues/${bottom.number}/comments`)) return JSON.stringify([[ask]]);
      else if (args.includes("--paginate")) return "[[]]";
      else return "";
    });

    await expect(
      walkWindowStack({
        collectorSha: "",
        cwd: "",
        developSha: "",
        isDryRun: false,
        queueSha: "",
        stack: [bottom, above],
        viewerLogin,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: coderabbit, pull request #0 — the bot skipped its review again after it was asked (the bot ran no review — pass / Review skipped); the CodeRabbit plan or its billing is a person's, and @coderabbitai review on it resumes the stack]`,
    );
    expect(runGh.mock.calls.filter(([args]) => args[0] === "pr" && args[1] === "comment")).toStrictEqual([
      [["pr", "comment", above.number.toString(), "--body", PROBE_COMMENT]],
    ]);
  });
});
