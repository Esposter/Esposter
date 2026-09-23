import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import {
  DEVELOP_BRANCH,
  EXPRESS_TRAILER,
  QUEUE_BRANCH,
  RESHAPE_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

// The resolver is the Claude session the drain spawns, and the marker it leaves goes out through `gh`; git runs
// For real against the fixture
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(syncQueue, { timeout: FIXTURE_TEST_TIMEOUT_MS }, () => {
  const { commitFile, commitFiles, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
  const viewerLogin = "viewerLogin";
  const collectorSha = "collectorSha";
  const baseInput = { collectorSha, isDryRun: false, viewerLogin };
  // The attempts are read off the conflicting commit's own comments, one `gh` page of none unless a test says otherwise
  beforeEach(() => {
    runGh.mockReturnValue("[[]]");
    runSession.mockReset();
  });
  const filePath = `${TEST_FILENAME}.ts`;
  const nestedPath = `${TEST_FILENAME}/${TEST_FILENAME}.ts`;
  const readSubjects = (range: string): string[] => runGit(["log", "--format=%s", range], getCwd()).trim().split("\n");
  // Two sides of one line that rewrite it differently, and the resolution the resolver writes from both. Letters
  // Rather than the canonical space and double space: a patch id ignores whitespace, so `git cherry` reads two
  // Sides that differ only in it as one commit already ported and replays nothing
  const queueContent = "a";
  const fixContent = "b";
  const resolvedContent = `${fixContent}${queueContent}`;
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
    expect(runSession).not.toHaveBeenCalled();
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
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, fixContent));
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

    const { developSha, movedSha, queueSha } = setupMovedQueue(filePath, queueContent);

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
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, queueContent));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, fixContent));
    switchTo(rootSha);
    return { developSha, queueSha };
  };
  // What the resolver does by hand: both sides in the file, staged, and the sequence resumed
  const resolveConflict = (): void => {
    writeFileSync(join(getCwd(), filePath), resolvedContent);
    runGit(["add", filePath], getCwd());
    runGit(["cherry-pick", "--continue"], getCwd());
  };

  // The target repaired the same change itself, so the resolution comes out empty and git refuses `--continue`:
  // The queue's line reaches the file by the repair's hand, and nothing of the commit is left to land
  const setupAbsorbedConflict = (): { developSha: string; queueSha: string } => {
    const rootSha = readSha("HEAD");
    commitFile(filePath, "a\nOLD\nc\nd\ne\n");
    const baseSha = publish(DEVELOP_BRANCH, "HEAD");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, "a\nNEW\nc\nd\ne\n"));
    switchTo(baseSha);
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, "a\nc\nNEW\nd\ne\n"));
    switchTo(rootSha);
    return { developSha, queueSha };
  };

  test("takes a resolution the target absorbs whole as an empty copy naming its original", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupAbsorbedConflict();
    runSession.mockImplementation(() => {
      runGit(["checkout", "HEAD", "--", filePath], getCwd());
      runGit(["add", filePath], getCwd());
      runGit(["-c", "core.editor=true", "commit", "--allow-empty"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runGit(["show", "--format=%b", "--no-patch", syncedSha], getCwd())).toContain(
      `(cherry picked from commit ${queueSha})`,
    );
    expect(runGit(["show", "--format=", syncedSha], getCwd())).toBe("");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // Develop carries the queue's first commit as a repaired copy under another patch id — one more file in it — so
  // `git cherry` reads the original as owed and its replay comes out empty; the second conflicts, which is what
  // Puts the sequence's end to the resolver's check
  const setupAbsorbedReplay = (): { absorbedSha: string; developSha: string; queueSha: string } => {
    const rootSha = readSha("HEAD");
    commitFile(filePath, "");
    const baseSha = publish(DEVELOP_BRANCH, "HEAD");
    const absorbedSha = commitFile(nestedPath, "");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, queueContent));
    switchTo(baseSha);
    commitFiles([nestedPath, `${nestedPath}.ts`], "");
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, fixContent));
    switchTo(rootSha);
    return { absorbedSha, developSha, queueSha };
  };

  test("keeps a commit the target absorbed under another patch id as an empty copy the sequence's end carries", async () => {
    expect.hasAssertions();

    const { absorbedSha, developSha, queueSha } = setupAbsorbedReplay();
    vi.stubEnv("GIT_EDITOR", "true");
    runSession.mockImplementation(() => {
      resolveConflict();
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath, nestedPath]);
    const copySha = readSha(`${syncedSha}~1`);
    expect(runGit(["show", "--format=", copySha], getCwd())).toBe("");
    expect(runGit(["show", "--format=%b", "--no-patch", copySha], getCwd())).toContain(
      `(cherry picked from commit ${absorbedSha})`,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  test("sheds an empty copy on the next rewrite rather than replaying it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    runGit(["-c", "core.editor=true", "commit", "--allow-empty", "--message", "absorbed"], getCwd());
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, ""));
    switchTo(developSha);
    const movedDevelopSha = publish(DEVELOP_BRANCH, commitFile(nestedPath, ""));
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha: movedDevelopSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${movedDevelopSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("aborts a conflict on a dry run and leaves the queue where it was", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, isDryRun: true, queueSha })).resolves.toBe(
      queueSha,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runSession).not.toHaveBeenCalled();
  });

  test("hands a conflict to the resolver and pushes the queue it ran to the end", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    vi.stubEnv("GIT_EDITOR", "true");
    runSession.mockImplementation(() => {
      resolveConflict();
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledTimes(1);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(`stopped on ${queueSha} at these paths:\n\n- ${filePath}`);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runGit(["show", "--format=", syncedSha, "--", filePath], getCwd())).toContain(`+${resolvedContent}`);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // `--abort` is denied the resolver, and a session that ran it anyway exits clean over a clean tree with no
  // Sequencer open — the replay reset to the target, and the rewrite about to force-push every owed commit away
  test("fails the run when the resolver ends the sequence without the commits the queue owed", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runSession.mockImplementation(() => {
      runGit(["cherry-pick", "--abort"], getCwd());
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the resolver left 6ca8469b467e76e23cc04181de825f8d94960a44 unresolved (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  test("fails the run and counts the attempt when the resolver leaves the sequence open", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the resolver left 6ca8469b467e76e23cc04181de825f8d94960a44 unresolved (attempt 1 of 3)]`,
    );
    expect(runGh).toHaveBeenCalledTimes(2);
    expect(runGh.mock.calls[1]?.[0]).toContain(`repos/{owner}/{repo}/commits/${queueSha}/comments`);
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(SYNC_FAILED_MARKER, queueSha, [collectorSha]));
  });

  test("leaves a conflict past the attempt cap to a person without spending a session", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    const commitComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: getMarker(SYNC_FAILED_MARKER, queueSha, [collectorSha]),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    runGh.mockReturnValue(JSON.stringify([commitComments]));

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runGh.mock.calls[0]?.[0]).toContain(`repos/{owner}/{repo}/commits/${queueSha}/comments?per_page=100`);
    expect(runSession).not.toHaveBeenCalled();
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
  });

  // The count reads only the attempts made against this collector's source: markers another collector's code ran
  // Up say nothing about this one, so the commit gets its turn again with nothing reset by hand
  test("gives a conflict past the cap under another collector a fresh turn", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runGh.mockReturnValue(
      JSON.stringify([
        Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
          body: getMarker(SYNC_FAILED_MARKER, queueSha, ["otherCollectorSha"]),
          id,
          updated_at: "",
          user: { login: viewerLogin },
        })),
      ]),
    );
    vi.stubEnv("GIT_EDITOR", "true");
    runSession.mockImplementation(() => {
      resolveConflict();
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledTimes(1);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
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
    runSession.mockImplementation(() => {
      reshape(oversizedSha, REVIEW_FILE_CAP);
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledTimes(1);
    expect(runSession.mock.calls[0]?.[0].prompt).toContain(
      `parent of ${oversizedSha}, a commit on \`ai/queue\` that changes ${REVIEW_FILE_CAP + 1} files`,
    );
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath, "rule", "moves"]);
    const claimedSha = readSha(`${syncedSha}~2`);
    expect(readTrailedShas([claimedSha], EXPRESS_TRAILER, getCwd())).toStrictEqual(new Set([claimedSha]));
    expect(runGit(["diff", queueSha, syncedSha], getCwd())).toBe("");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // The copy a resolution left this run sits behind the reshaped commit, and rides the replay of what followed it
  test("replays an empty copy behind the reshaped commit", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const oversizedSha = commitFiles(overflowPaths, "");
    runGit(["-c", "core.editor=true", "commit", "--allow-empty", "--message", "absorbed"], getCwd());
    const queueSha = publish(QUEUE_BRANCH, "HEAD");
    runSession.mockImplementation(() => {
      reshape(oversizedSha, REVIEW_FILE_CAP);
      return Promise.resolve({ isEnded: true, isStarted: true });
    });
    const syncedSha = await syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual(["absorbed", "rule", "moves"]);
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
    expect(runSession).not.toHaveBeenCalled();
  });

  test("fails the run and counts the attempt when the reshaping leaves a reviewable part over the cap", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runSession.mockImplementation(() => {
      reshape(oversizedSha, 0);
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left 790c344961556abb76524da297401750f776af92 over the cap without an Express trailer (attempt 1 of 3 on e1b1241d5399c7d8234f33a42c525fc449150d8c)]`,
    );
    expect(runGh.mock.calls[1]?.[0]).toContain(`repos/{owner}/{repo}/commits/${oversizedSha}/comments`);
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(RESHAPE_FAILED_MARKER, oversizedSha, [collectorSha]));
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
    expect(readSha("HEAD")).toBe(queueSha);
  });

  // Every queue commit a rewrite replayed names its copies, and a part keeping them shares them with its siblings —
  // So the express lane's copy of one part would read every part as ported, and the next sync would drop the rest
  test("fails the run and counts the attempt when a part keeps the lines naming the original's copies", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runSession.mockImplementation(() => {
      runGit(["checkout", oversizedSha, "--", ...overflowPaths], getCwd());
      runGit(
        [
          "commit",
          "--quiet",
          "--message",
          `moves\n\n(cherry picked from commit ${developSha})`,
          "--trailer",
          `${EXPRESS_TRAILER}: ${TEST_FILENAME}`,
        ],
        getCwd(),
      );
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left a part naming the copies e1b1241d5399c7d8234f33a42c525fc449150d8c was replayed from (attempt 1 of 3 on e1b1241d5399c7d8234f33a42c525fc449150d8c)]`,
    );
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(RESHAPE_FAILED_MARKER, oversizedSha, [collectorSha]));
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  // The session is handed a repackaging, never the cherry-pick this step runs itself, so what it leaves open is
  // Any operation at all — and a restore refuses over one, which would cost the attempt the record that caps it
  test("fails the run and counts the attempt when the reshaping leaves a merge open", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runSession.mockImplementation(() => {
      const baseSha = readSha("HEAD");
      const theirsSha = commitFile(filePath, queueContent);
      switchTo(baseSha);
      commitFile(filePath, fixContent);
      getResult(() => runGit(["merge", theirsSha], getCwd())).unwrapOr("");
      return Promise.resolve({ isEnded: true, isStarted: true });
    });

    await expect(
      syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left an operation in progress (attempt 1 of 3 on e1b1241d5399c7d8234f33a42c525fc449150d8c)]`,
    );
    expect(runGh.mock.calls[1]?.[0].at(-1)).toContain(getMarker(RESHAPE_FAILED_MARKER, oversizedSha, [collectorSha]));
    expect(readSha("HEAD")).toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  test("leaves a commit past the reshape attempt cap to the port and a person", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runGh.mockReturnValue(
      JSON.stringify([
        Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
          body: getMarker(RESHAPE_FAILED_MARKER, oversizedSha, [collectorSha]),
          id,
          updated_at: "",
          user: { login: viewerLogin },
        })),
      ]),
    );

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("reports the reshaping it would do on a dry run", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupOversized();

    await expect(syncQueue({ ...baseInput, cwd: getCwd(), developSha, isDryRun: true, queueSha })).resolves.toBe(
      queueSha,
    );
    expect(runSession).not.toHaveBeenCalled();
  });
});
