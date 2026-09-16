import type { runDrain as baseRunDrain } from "#src/services/coderabbit/collect/runDrain";
import type { runGh as baseRunGh } from "#src/services/coderabbit/shared/runGh";

import {
  DEVELOP_BRANCH,
  DRAIN_ATTEMPT_CAP,
  EXPRESS_TRAILER,
  QUEUE_BRANCH,
  RESHAPE_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { readExpressShas } from "#src/services/coderabbit/collect/readExpressShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

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
  const { commitFile, commitFiles, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const baseInput = { isDryRun: false, viewerLogin };
  // The attempts are read off the conflicting commit's own comments, one `gh` page of none unless a test says otherwise
  beforeEach(() => {
    runGh.mockReturnValue("[[]]");
  });
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

    assert.exists(syncedSha);
    expect(syncedSha).not.toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath]);
    expect(runGit(["show", "--format=%b", "--no-patch", syncedSha], getCwd()).trim()).toBe(
      `(cherry picked from commit ${owedSha})`,
    );
    expect(runGit(["show", "--format=", syncedSha], getCwd())).toBe(runGit(["show", "--format=", owedSha], getCwd()));
    expect(runDrain).not.toHaveBeenCalled();
  });

  test("rebuilds the queue on the fixes branch while it still owes develop commits", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const owingFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(filePath, ""));
    switchTo(developSha);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, owingFixesSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath, filePath]);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // The session pushed between the read and the rewrite's push: the lease refuses, and the push moved the queue
  // Forward from the sha the run read — so what it gained rides the rewrite, and the retry's lease is the new head
  const setupMovedQueue = (
    movedPath: string,
    movedContent: string,
  ): { developSha: string; movedSha: string; queueSha: string } => {
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, "fix"));
    switchTo(`${developSha}~1`);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    const movedSha = publish(TEST_FILENAME, commitFile(movedPath, movedContent));
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${QUEUE_BRANCH} ${movedSha}`);
    return { developSha, movedSha, queueSha };
  };

  test("carries what the session pushed under the rewrite and pushes under the lease it moved to", async () => {
    expect.hasAssertions();

    const carriedPath = `${nestedPath}.ts`;
    const { developSha, queueSha } = setupMovedQueue(carriedPath, "");
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([carriedPath, nestedPath]);
  });

  test("leaves the rewrite unpushed when a commit the session pushed under it conflicts with it", async () => {
    expect.hasAssertions();

    const { developSha, movedSha, queueSha } = setupMovedQueue(filePath, "queue");

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBeUndefined();
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(movedSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  test("leaves the rewrite unpushed when the session rewrote the queue's history under it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, ""));
    switchTo(`${developSha}~1`);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    switchTo(`${developSha}~1`);
    const rewrittenSha = publish(TEST_FILENAME, commitFile(`${nestedPath}.ts`, ""));
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${QUEUE_BRANCH} ${rewrittenSha}`);

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBeUndefined();
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(rewrittenSha);
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

  test("hands a conflict to the resolver and pushes the queue it ran to the end", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    vi.stubEnv("GIT_EDITOR", "true");
    runDrain.mockImplementation(() => {
      resolveConflict();
      return Promise.resolve({ isDrained: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runDrain).toHaveBeenCalledTimes(1);
    expect(runDrain.mock.calls[0]?.[0]).toContain(`stopped on ${queueSha} at these paths:\n\n- ${filePath}`);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runGit(["show", "--format=", syncedSha, "--", filePath], getCwd())).toContain("+fix queue");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // `--abort` is denied the resolver, and a session that ran it anyway exits clean over a clean tree with no
  // Sequencer open — the replay reset to the target, and the rewrite about to force-push every owed commit away
  test("fails the run when the resolver ends the sequence without the commits the queue owed", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runDrain.mockImplementation(() => {
      runGit(["cherry-pick", "--abort"], getCwd());
      return Promise.resolve({ isDrained: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, the resolver left afc657d5e91e3511c65c73f432615a705c835c36 unresolved (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
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
    expect(runGh).toHaveBeenCalledTimes(2);
    expect(runGh.mock.calls[1]?.[0]).toContain(`repos/{owner}/{repo}/commits/${queueSha}/comments`);
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(SYNC_FAILED_MARKER, queueSha));
  });

  test("leaves a conflict past the attempt cap to a person without spending a session", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    const commitComments = Array.from({ length: DRAIN_ATTEMPT_CAP }, (_, id) => ({
      body: getMarker(SYNC_FAILED_MARKER, queueSha),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    runGh.mockReturnValue(JSON.stringify([commitComments]));

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runGh.mock.calls[0]?.[0]).toContain(`repos/{owner}/{repo}/commits/${queueSha}/comments?per_page=100`);
    expect(runDrain).not.toHaveBeenCalled();
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  // A commit alone over the cap can never ride a window, so the sync hands it to the reshaper before the port
  // Reads it: the parts that need no review claim the express lane, the rest fit the cap, and the tree is the same
  const overflowPaths = Array.from({ length: REVIEW_FILE_CAP + 1 }, (_value, index) => `${TEST_FILENAME}/${index}`);
  const setupOversized = (): { developSha: string; oversizedSha: string; queueSha: string } => {
    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const oversizedSha = commitFiles(overflowPaths, "");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, ""));
    return { developSha, oversizedSha, queueSha };
  };
  // What the reshaper does by hand: one trailered part carrying the first files, one reviewable part with the rest
  const reshape = (oversizedSha: string, splitAt: number): void => {
    if (splitAt > 0) {
      runGit(["checkout", oversizedSha, "--", ...overflowPaths.slice(0, splitAt)], getCwd());
      runGit(
        ["commit", "--quiet", "--message", "moves", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
        getCwd(),
      );
    }
    runGit(["checkout", oversizedSha, "--", ...overflowPaths.slice(splitAt)], getCwd());
    runGit(["commit", "--quiet", "--message", "rule"], getCwd());
  };

  test("reshapes the first commit alone over the cap and replays what followed it", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runDrain.mockImplementation(() => {
      reshape(oversizedSha, REVIEW_FILE_CAP);
      return Promise.resolve({ isDrained: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runDrain).toHaveBeenCalledTimes(1);
    expect(runDrain.mock.calls[0]?.[0]).toContain(
      `parent of ${oversizedSha}, a commit on \`ai/queue\` that changes ${REVIEW_FILE_CAP + 1} files`,
    );
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath, "rule", "moves"]);
    const claimedSha = readSha(`${syncedSha}~2`);
    expect(readExpressShas([claimedSha], getCwd())).toStrictEqual(new Set([claimedSha]));
    expect(runGit(["diff", queueSha, syncedSha], getCwd())).toBe("");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  test("leaves an over-cap commit claiming no review to the express lane", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    commitFiles(overflowPaths, "");
    runGit(
      ["commit", "--quiet", "--amend", "--no-edit", "--trailer", `${EXPRESS_TRAILER}: ${TEST_FILENAME}`],
      getCwd(),
    );
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, ""));

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runDrain).not.toHaveBeenCalled();
  });

  test("fails the run and counts the attempt when the reshaping leaves a reviewable part over the cap", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runDrain.mockImplementation(() => {
      reshape(oversizedSha, 0);
      return Promise.resolve({ isDrained: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, the reshaper left 790c344961556abb76524da297401750f776af92 over the cap without an Express trailer (attempt 1 of 3 on e1b1241d5399c7d8234f33a42c525fc449150d8c)]`,
    );
    expect(runGh.mock.calls[1]?.[0]).toContain(`repos/{owner}/{repo}/commits/${oversizedSha}/comments`);
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(RESHAPE_FAILED_MARKER, oversizedSha));
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(readSha("HEAD")).toBe(queueSha);
  });

  test("leaves a commit past the reshape attempt cap to the port and a person", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runGh.mockReturnValue(
      JSON.stringify([
        Array.from({ length: DRAIN_ATTEMPT_CAP }, (_, id) => ({
          body: getMarker(RESHAPE_FAILED_MARKER, oversizedSha),
          id,
          updated_at: "",
          user: { login: viewerLogin },
        })),
      ]),
    );

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runDrain).not.toHaveBeenCalled();
  });

  test("reports the reshaping it would do on a dry run", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupOversized();

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, isDryRun: true, queueSha })).resolves.toBe(
      queueSha,
    );
    expect(runDrain).not.toHaveBeenCalled();
  });
});
