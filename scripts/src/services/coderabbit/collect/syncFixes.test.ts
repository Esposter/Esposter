import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  DEVELOP_BRANCH,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncFixes } from "#src/services/coderabbit/collect/syncFixes";
import { runGit } from "#src/services/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(syncFixes, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const baseInput = { collectorSha, isDryRun: false, viewerLogin };
  beforeEach(() => {
    runGh.mockReturnValue("[[]]");
    runSession.mockReset();
  });
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  const fixContent = "a";
  const developContent = "b";
  const readSubjects = (range: string): string[] => runGit(["log", "--format=%s", range], getCwd()).trim().split("\n");
  // A drain built its fix on the develop it read, and develop moved under it before the fix ported
  const setupMovedDevelop = (movedPath: string): { developSha: string; owingFixesSha: string } => {
    const rootSha = readSha("HEAD");
    commitFile(filePath, "");
    const baseSha = publish(DEVELOP_BRANCH, "HEAD");
    const owingFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(filePath, fixContent));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(movedPath, developContent));
    switchTo(rootSha);
    return { developSha, owingFixesSha };
  };

  test("replays the fixes onto a develop that moved and pushes them under the lease", async () => {
    expect.hasAssertions();

    const { developSha, owingFixesSha } = setupMovedDevelop(nestedPath);
    const result = await syncFixes({ ...baseInput, cwd: getCwd(), developSha, owingFixesSha });

    expect(result.outcome).toBeUndefined();
    expect(readSha(`origin/${REVIEW_FIXES_BRANCH}`)).toBe(result.owingFixesSha);
    expect(readSubjects(`${developSha}..${result.owingFixesSha}`)).toStrictEqual([filePath]);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("hands a fix that conflicts with develop to the resolver", async () => {
    expect.hasAssertions();

    const { developSha, owingFixesSha } = setupMovedDevelop(filePath);
    const resolvedContent = `${developContent}${fixContent}`;
    vi.stubEnv("GIT_EDITOR", "true");
    runSession.mockImplementation(() => {
      writeFileSync(join(getCwd(), filePath), resolvedContent);
      runGit(["add", filePath], getCwd());
      runGit(["cherry-pick", "--continue"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const result = await syncFixes({ ...baseInput, cwd: getCwd(), developSha, owingFixesSha });

    expect(runSession).toHaveBeenCalledTimes(1);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(`the commits \`${REVIEW_FIXES_BRANCH}\` still owes`);
    expect(readSha(`origin/${REVIEW_FIXES_BRANCH}`)).toBe(result.owingFixesSha);
    expect(runGit(["show", `${result.owingFixesSha}:${filePath}`], getCwd())).toBe(resolvedContent);
  });

  test("ends a dry run idle on a conflict, the fixes where they were", async () => {
    expect.hasAssertions();

    const { developSha, owingFixesSha } = setupMovedDevelop(filePath);
    const result = await syncFixes({ ...baseInput, cwd: getCwd(), developSha, isDryRun: true, owingFixesSha });

    expect(result.outcome?.kind).toBe(CycleOutcomeKind.Idle);
    expect(readSha(`origin/${REVIEW_FIXES_BRANCH}`)).toBe(owingFixesSha);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("fails the run on a conflict past the attempt cap", async () => {
    expect.hasAssertions();

    const { developSha, owingFixesSha } = setupMovedDevelop(filePath);
    const commitComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: getMarker(SYNC_FAILED_MARKER, owingFixesSha, [collectorSha]),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    runGh.mockReturnValue(JSON.stringify([commitComments]));

    await expect(
      syncFixes({ ...baseInput, cwd: getCwd(), developSha, owingFixesSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, ai/review-fixes conflicts with develop past the attempt cap, so a person rebases it (the conflicting fix's commit comments say which)]`,
    );
    expect(runSession).not.toHaveBeenCalled();
    expect(readSha(`origin/${REVIEW_FIXES_BRANCH}`)).toBe(owingFixesSha);
  });
});
