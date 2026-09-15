import type { readUnresolvedThreads as baseReadUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";

import { ANSWERS_TRAILER, DEVELOP_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { describe, expect, test, vi } from "vitest";

const { readUnresolvedThreads } = vi.hoisted(() => ({
  readUnresolvedThreads: vi.fn<typeof baseReadUnresolvedThreads>(),
}));

// The one `gh` read the clean path makes; git runs for real against the fixture
vi.mock(import("#src/services/coderabbit/feedback/readUnresolvedThreads"), () => ({
  readUnresolvedThreads: readUnresolvedThreads as unknown as typeof baseReadUnresolvedThreads,
}));

describe(runDrainStep, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const baseInput = {
    frontierCommits: [],
    isDryRun: false,
    issueComments: [],
    pullRequest: 0,
    reviews: [],
    viewerLogin: "viewerLogin",
  };
  const commitAnswer = (): string => {
    commitFile(TEST_FILENAME, "");
    runGit(["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${ANSWERS_TRAILER}: 1`], getCwd());
    return readSha("HEAD");
  };

  // The fixes branch keeps its head after a window carries it, so its commits list against develop by range
  // While `git cherry` knows every one is upstream
  test("is clean once the fixes branch's answer is on develop under another sha", async () => {
    expect.hasAssertions();

    readUnresolvedThreads.mockReturnValue([]);
    const mainSha = readSha("HEAD");
    const reviewFixesSha = commitAnswer();
    switchTo(mainSha);
    // Develop moves first, so the ported copy hashes differently from the fix it carries
    commitFile(`${TEST_FILENAME}.ts`, "");
    runGit(["cherry-pick", "--quiet", reviewFixesSha], getCwd());
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    publish(QUEUE_BRANCH, developSha);
    const result = await runDrainStep({
      ...baseInput,
      cwd: getCwd(),
      developSha,
      queueSha: developSha,
      reviewFixesSha,
    });

    expect(result).toStrictEqual({ isClean: true, reviewFixesSha });
  });

  test("is not clean while the queue's answer is unported", async () => {
    expect.hasAssertions();

    readUnresolvedThreads.mockReturnValue([]);
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const queueSha = publish(QUEUE_BRANCH, commitAnswer());
    const result = await runDrainStep({ ...baseInput, cwd: getCwd(), developSha, queueSha, reviewFixesSha: undefined });

    expect(result).toStrictEqual({ isClean: false, reviewFixesSha: undefined });
  });
});
