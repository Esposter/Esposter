import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { drainFindings as baseDrainFindings } from "#src/services/coderabbit/collect/drainFindings";
import type { readUnresolvedThreads as baseReadUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";

import { ANSWERS_TRAILER, DEVELOP_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { CODERABBIT_GRAPHQL_LOGIN, CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { describe, expect, test, vi } from "vitest";

const { drainFindings, readUnresolvedThreads } = vi.hoisted(() => ({
  drainFindings: vi.fn<typeof baseDrainFindings>(),
  readUnresolvedThreads: vi.fn<typeof baseReadUnresolvedThreads>(),
}));

// The one `gh` read the step makes, and the Claude session it would spawn; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/feedback/readUnresolvedThreads"), () => ({
  readUnresolvedThreads: readUnresolvedThreads as unknown as typeof baseReadUnresolvedThreads,
}));

vi.mock(import("#src/services/coderabbit/collect/drainFindings"), () => ({
  drainFindings: drainFindings as unknown as typeof baseDrainFindings,
}));

describe(runDrainStep, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish } = setupFixtureRepository();
  const baseInput = {
    collectorSha: "collectorSha",
    developCommits: [],
    isDryRun: false,
    issueComments: [],
    pullRequest: 0,
    reviews: [],
    viewerLogin: "viewerLogin",
  };
  const commentId = 1;
  const review: GitHubReview = {
    body: " ",
    commit_id: "",
    id: 0,
    submitted_at: "",
    updated_at: "",
    user: { login: CODERABBIT_REST_LOGIN },
  };
  const thread = { body: "", commentId, lastAuthorLogin: CODERABBIT_GRAPHQL_LOGIN, lastBody: "", path: TEST_FILENAME };

  test("does not drain a thread the queue already answers", async () => {
    expect.hasAssertions();

    readUnresolvedThreads.mockReturnValue([thread]);
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    commitFile(TEST_FILENAME, "");
    runGit(["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${ANSWERS_TRAILER}: ${commentId}`], getCwd());
    const queueSha = publish(QUEUE_BRANCH, "HEAD");
    const result = await runDrainStep({ ...baseInput, cwd: getCwd(), developSha, queueSha, reviews: [review] });

    expect(drainFindings).not.toHaveBeenCalled();
    expect(result).toStrictEqual({ reviewFixesSha: undefined });
  });

  // The reply is best-effort, so the thread may still read as the bot's; the commit develop carries is the answer
  test("does not drain a thread a commit on develop answers", async () => {
    expect.hasAssertions();

    readUnresolvedThreads.mockReturnValue([thread]);
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const result = await runDrainStep({
      ...baseInput,
      cwd: getCwd(),
      developCommits: [{ answers: [commentId], drains: [], sha: developSha, subject: "" }],
      developSha,
      queueSha: developSha,
      reviews: [review],
    });

    expect(drainFindings).not.toHaveBeenCalled();
    expect(result).toStrictEqual({ reviewFixesSha: undefined });
  });
});
