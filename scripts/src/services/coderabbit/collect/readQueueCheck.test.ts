import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import {
  CI_COMPLETED_STATUS,
  CI_SUCCESS_CONCLUSION,
  DEVELOP_BRANCH,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { readQueueCheck } from "#src/services/coderabbit/collect/readQueueCheck";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

const getRun = (headBranch: string, conclusion: string): MainCheck => ({
  conclusion,
  createdAt: "",
  databaseId: 0,
  headBranch,
  headSha: "",
  status: CI_COMPLETED_STATUS,
  updatedAt: "",
  url: "",
  workflowDatabaseId: 0,
});

// The runs GitHub lists for a workflow: those of the branch a read names, and otherwise a list the Renovate branches
// Fill on every move of `main`
const answerRuns = (branchRunsMap: Map<string, MainCheck[]>): void => {
  runGh.mockImplementation((args) => {
    const branch = args.includes("--branch") ? args[args.indexOf("--branch") + 1] : undefined;
    return JSON.stringify(
      branch === undefined ? [getRun("renovate", CI_SUCCESS_CONCLUSION)] : (branchRunsMap.get(branch) ?? []),
    );
  });
};

describe(readQueueCheck, () => {
  // The newest page of every branch's runs held about an hour and a quarter of them, so the bumps pushed the queue's
  // Verdict out of reach; narrowed to the queue, a pending run a newer push superseded is the only one passed over
  test("reads the queue's newest verdict among its own runs alone", () => {
    expect.hasAssertions();

    const queueRun = getRun(QUEUE_BRANCH, CI_SUCCESS_CONCLUSION);
    answerRuns(new Map([[QUEUE_BRANCH, [getRun(QUEUE_BRANCH, "cancelled"), queueRun]]]));

    expect(readQueueCheck(queueRun)).toStrictEqual(queueRun);
  });

  test("falls back to develop's newest verdict where the queue has none", () => {
    expect.hasAssertions();

    const developRun = getRun(DEVELOP_BRANCH, CI_SUCCESS_CONCLUSION);
    answerRuns(new Map([[DEVELOP_BRANCH, [developRun]]]));

    expect(readQueueCheck(developRun)).toStrictEqual(developRun);
  });
});
