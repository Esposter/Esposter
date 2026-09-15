import type { runDrain as baseRunDrain } from "#src/services/coderabbit/collect/runDrain";
import type { runGh as baseRunGh } from "#src/services/coderabbit/shared/runGh";

import {
  DEVELOP_BRANCH,
  DRAIN_ATTEMPT_CAP,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

const { runDrain, runGh } = vi.hoisted(() => ({
  runDrain: vi.fn<typeof baseRunDrain>(),
  runGh: vi.fn<typeof baseRunGh>(),
}));

// The resolver is the Claude session the drain spawns, and the marker it leaves goes out through `gh`; git runs
// For real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runDrain"), () => ({
  runDrain: runDrain as unknown as typeof baseRunDrain,
}));

vi.mock(import("#src/services/coderabbit/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(syncQueue, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, getCwd, publish, readSha, switchTo } = setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const pullRequest = 0;
  const baseInput = { isDryRun: false, issueComments: [], pullRequest, viewerLogin };
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  const readSubjects = (range: string): string[] => runGit(["log", "--format=%s", range], getCwd()).trim().split("\n");
  // A window ported one queue commit with a fix landing inside its context lines, which is the drift that makes
  // `git cherry` read the copy as still owed; the queue then grew one more commit
  const setupDriftedPort = (): { developSha: string; owedSha: string; queueSha: string } => {
    const rootSha = readSha("HEAD");
    commitFile(filePath, "1\n2\n3\n4\n5\n");
    const baseSha = publish(DEVELOP_BRANCH, "HEAD");
    const portedSha = commitFile(filePath, "1\n2\nx\n4\n5\n");
    const owedSha = commitFile(nestedPath, "");
    const queueSha = publish(QUEUE_BRANCH, "HEAD");
    switchTo(baseSha);
    commitFile(filePath, "1\n2\n3\n4\ny\n");
    runGit(["cherry-pick", "-x", portedSha], getCwd());
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    switchTo(rootSha);
    return { developSha, owedSha, queueSha };
  };

  test("leaves a queue that already sits on develop alone", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, ""));

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  test("replays only what the queue still owes, dropping a ported copy whose patch id drifted", async () => {
    expect.hasAssertions();

    const { developSha, owedSha, queueSha } = setupDriftedPort();
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    expect(syncedSha).not.toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath]);
    expect(runGit(["show", "--format=%b", "--no-patch", syncedSha], getCwd()).trim()).toBe("");
    expect(runGit(["show", "--format=", syncedSha], getCwd())).toBe(runGit(["show", "--format=", owedSha], getCwd()));
    expect(runDrain).not.toHaveBeenCalled();
  });

  test("rebuilds the queue on the fixes branch while it still owes develop commits", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const reviewFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(filePath, ""));
    switchTo(developSha);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha, reviewFixesSha });

    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath, filePath]);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // The queue's commit and develop's fix rewrote the same line; nothing mechanical decides that
  const setupConflict = (): { developSha: string; queueSha: string } => {
    const rootSha = readSha("HEAD");
    commitFile(filePath, "");
    const baseSha = publish(DEVELOP_BRANCH, "HEAD");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, "queue"));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, "fix"));
    switchTo(rootSha);
    return { developSha, queueSha };
  };
  // What the resolver does by hand: both sides in the file, staged, and the sequence resumed
  const resolveConflict = (): void => {
    writeFileSync(join(getCwd(), filePath), "fix queue");
    runGit(["add", filePath], getCwd());
    runGit(["cherry-pick", "--continue"], getCwd());
  };

  test("aborts a conflict on a dry run and leaves the queue where it was", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, isDryRun: true, queueSha })).resolves.toBe(
      queueSha,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runDrain).not.toHaveBeenCalled();
  });

  test("leaves a conflict to a person when no release pull request can count the attempt", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, pullRequest: undefined, queueSha }),
    ).resolves.toBe(queueSha);
    expect(runDrain).not.toHaveBeenCalled();
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  test("hands a conflict to the resolver and pushes the queue it ran to the end", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    vi.stubEnv("GIT_EDITOR", "true");
    runDrain.mockImplementation(() => {
      resolveConflict();
      return Promise.resolve({ isDrained: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    expect(runDrain).toHaveBeenCalledTimes(1);
    expect(runDrain.mock.calls[0]?.[0]).toContain(`stopped on ${queueSha} at these paths:\n\n- ${filePath}`);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runGit(["show", "--format=", syncedSha, "--", filePath], getCwd())).toContain("+fix queue");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  test("fails the run and counts the attempt when the resolver leaves the sequence open", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runDrain.mockResolvedValue({ isDrained: true });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, the resolver left afc657d5e91e3511c65c73f432615a705c835c36 unresolved (attempt 1 of 3)]`,
    );
    expect(runGh).toHaveBeenCalledTimes(1);
    expect(runGh.mock.calls[0]?.[0].at(-1)).toContain(getMarker(SYNC_FAILED_MARKER, queueSha));
  });

  test("leaves a conflict past the attempt cap to a person without spending a session", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    const issueComments = Array.from({ length: DRAIN_ATTEMPT_CAP }, (_, id) => ({
      body: getMarker(SYNC_FAILED_MARKER, queueSha),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, issueComments, queueSha })).resolves.toBe(
      queueSha,
    );
    expect(runDrain).not.toHaveBeenCalled();
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });
});
