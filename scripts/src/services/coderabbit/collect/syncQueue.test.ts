import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import {
  DEVELOP_BRANCH,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RESHAPE_FAILED_MARKER,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { FIXTURE_TEST_TIMEOUT_MS, TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getReshapePrompt } from "#src/services/coderabbit/collect/getReshapePrompt";
import { getSyncPrompt } from "#src/services/coderabbit/collect/getSyncPrompt";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, takeOne } from "@esposter/shared";
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
  // Every queue here is owed above `main`'s root, so that root is the merge base each window counts from
  const readBaseInput = () => ({
    baseSha: readSha(`origin/${MAIN_BRANCH}`),
    collectorSha,
    cwd: getCwd(),
    fileCap: REVIEW_FILE_CAP,
    isDryRun: false,
    viewerLogin,
  });
  // A commit's attempts past the cap, read off its own comments, while the issue a park opens finds none open before it
  const mockExhaustedAttempts = (marker: string, sha: string): void => {
    const commitComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: getMarker(marker, sha, [collectorSha]),
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));
    runGh.mockImplementation(([command]) => (command === "issue" ? "[]" : JSON.stringify([commitComments])));
  };
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

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  test("replays only what the queue still owes, dropping a ported copy whose patch id drifted", async () => {
    expect.hasAssertions();

    const { developSha, owedSha, queueSha } = setupDriftedPort();
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

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
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, owingFixesSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath, filePath]);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // The session pushed between the read and the rewrite's push: the lease refuses, and the push moved the queue
  // Forward from the sha the run read — so what it gained rides the rewrite, and the retry's lease is the new head.
  // Develop added a file with the fix's side, so a gained commit adding it with the queue's conflicts with the rewrite
  const carriedPath = `${nestedPath}.ts`;
  const setupMovedQueue = (gainedPaths: string[]): { developSha: string; gainedShas: string[]; queueSha: string } => {
    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, fixContent));
    switchTo(`${developSha}~1`);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    const gainedShas = gainedPaths.map((path) => commitFile(path, queueContent));
    const movedSha = publish(TEST_FILENAME, "HEAD");
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${QUEUE_BRANCH} ${movedSha}`);
    return { developSha, gainedShas, queueSha };
  };

  test("carries what the session pushed under the rewrite and pushes under the lease it moved to", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupMovedQueue([carriedPath]);
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([carriedPath, nestedPath]);
  });

  // The sync's minutes are never thrown away for one commit: the conflicting one is set aside with a record, and
  // What the session pushed after it still rides the rewrite
  test("parks a commit the session pushed under the rewrite that conflicts with it, and pushes the rest", async () => {
    expect.hasAssertions();

    const { developSha, gainedShas, queueSha } = setupMovedQueue([filePath, carriedPath]);
    const conflictSha = takeOne(gainedShas, 0);
    runGh.mockReturnValue("[]");
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([carriedPath, nestedPath]);
    expect(readSha(`origin/${getHeldBranch(conflictSha)}`)).toBe(conflictSha);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("");
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "issue",
            "list",
            "--state",
            "open",
            "--author",
            "viewerLogin",
            "--label",
            "ready-for-agent",
            "--limit",
            "1000",
            "--json",
            "number,body",
          ],
        ],
        [
          [
            "issue",
            "create",
            "--title",
            "Held: a.ts (1 commit)",
            "--label",
            "ready-for-agent",
            "--body",
            "<!-- review-collector held commit:13475045b6ec345c9896f8f91d6f0b367d86098b -->
      it was pushed to \`ai/queue\` while the collector rewrote it, and conflicts with the rewrite

      - 13475045b6ec345c9896f8f91d6f0b367d86098b a.ts, held on \`ai/held/13475045b6\`

      To re-land them, on \`ai/queue\`:

      1. \`git fetch origin\`
      2. For each held branch above, in order: \`git cherry-pick --no-commit origin/<branch>\`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, \`git commit -m "<subject>"\` — never the message the pick prepares, nor \`-x\`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted
      3. \`pnpm ai:queue:push\`, after which each new commit ports like any other
      4. \`git push origin --delete <branch>\` for each held branch, then close this issue",
          ],
        ],
      ]
    `);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("leaves the rewrite unpushed when the session rewrote the queue's history under it", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, commitFile(filePath, ""));
    switchTo(`${developSha}~1`);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    switchTo(`${developSha}~1`);
    const rewrittenSha = publish(TEST_FILENAME, commitFile(`${nestedPath}.ts`, ""));
    installPreReceiveHook(`env -u GIT_QUARANTINE_PATH git update-ref refs/heads/${QUEUE_BRANCH} ${rewrittenSha}`);

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).resolves.toBeUndefined();
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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runGit(["show", "--format=%b", "--no-patch", syncedSha], getCwd()).trim()).toBe(
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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath, nestedPath]);
    const copySha = readSha(`${syncedSha}~1`);
    expect(runGit(["show", "--format=", copySha], getCwd())).toBe("");
    expect(runGit(["show", "--format=%b", "--no-patch", copySha], getCwd()).trim()).toBe(
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
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha: movedDevelopSha, queueSha });

    assert.exists(syncedSha);
    expect(readSubjects(`${movedDevelopSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("aborts a conflict on a dry run and leaves the queue where it was", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();

    await expect(syncQueue({ ...readBaseInput(), developSha, isDryRun: true, queueSha })).resolves.toBe(queueSha);
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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledExactlyOnceWith({
      cwd: getCwd(),
      model: SessionRoleModelMap[SessionRole.Sync],
      prompt: getSyncPrompt({
        branch: QUEUE_BRANCH,
        conflictedPaths: [filePath],
        conflictSha: queueSha,
        targetBranch: DEVELOP_BRANCH,
      }),
    });
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runGit(["show", "--format=", syncedSha, "--", filePath], getCwd())).toMatchInlineSnapshot(`
      "diff --git a/a.ts b/a.ts
      index 63d8dbd..6612d39 100644
      --- a/a.ts
      +++ b/a.ts
      @@ -1 +1 @@
      -b
      \\ No newline at end of file
      +ba
      \\ No newline at end of file
      "
    `);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
  });

  // `--abort` is denied the resolver, and a session that ran it anyway exits clean over a clean tree with no
  // Sequencer open — the replay reset to the target, and the rewrite about to force-push every owed commit away
  test("fails the run when the resolver ends the sequence without the commits the queue owed", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runSession.mockImplementation(() => {
      runGit(["cherry-pick", "--abort"], getCwd());
      return Promise.resolve({ isEnded: true });
    });

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the resolver left 6ca8469b467e76e23cc04181de825f8d94960a44 unresolved (attempt 1 of 3)]`,
    );
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  test("fails the run and counts the attempt when the resolver leaves the sequence open", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupConflict();
    runSession.mockResolvedValue({ isEnded: true });

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the resolver left 6ca8469b467e76e23cc04181de825f8d94960a44 unresolved (attempt 1 of 3)]`,
    );
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/6ca8469b467e76e23cc04181de825f8d94960a44/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/6ca8469b467e76e23cc04181de825f8d94960a44/comments",
            "-f",
            "body=<!-- review-collector sync-failed commit:6ca8469b467e76e23cc04181de825f8d94960a44 against:collectorSha -->
      Attempt 1 of 3 to resolve the conflict 6ca8469b467e76e23cc04181de825f8d94960a44 brings to develop failed. See the collector run.",
          ],
        ],
      ]
    `);
  });

  test("parks a conflict past the attempt cap on its held branch, opens one issue and replays the rest", async () => {
    expect.hasAssertions();

    const { developSha, queueSha: conflictSha } = setupConflict();
    switchTo(conflictSha);
    const queueSha = publish(QUEUE_BRANCH, commitFile(nestedPath, ""));
    mockExhaustedAttempts(SYNC_FAILED_MARKER, conflictSha);
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSha(`origin/${getHeldBranch(conflictSha)}`)).toBe(conflictSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath]);
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/6ca8469b467e76e23cc04181de825f8d94960a44/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "issue",
            "list",
            "--state",
            "open",
            "--author",
            "viewerLogin",
            "--label",
            "ready-for-agent",
            "--limit",
            "1000",
            "--json",
            "number,body",
          ],
        ],
        [
          [
            "issue",
            "create",
            "--title",
            "Held: a.ts (1 commit)",
            "--label",
            "ready-for-agent",
            "--body",
            "<!-- review-collector held commit:6ca8469b467e76e23cc04181de825f8d94960a44 -->
      its conflict with develop failed the resolver 3 times

      - 6ca8469b467e76e23cc04181de825f8d94960a44 a.ts, held on \`ai/held/6ca8469b46\`

      To re-land them, on \`ai/queue\`:

      1. \`git fetch origin\`
      2. For each held branch above, in order: \`git cherry-pick --no-commit origin/<branch>\`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, \`git commit -m "<subject>"\` — never the message the pick prepares, nor \`-x\`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted
      3. \`pnpm ai:queue:push\`, after which each new commit ports like any other
      4. \`git push origin --delete <branch>\` for each held branch, then close this issue",
          ],
        ],
      ]
    `);
    expect(runSession).not.toHaveBeenCalled();
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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledExactlyOnceWith({
      cwd: getCwd(),
      model: SessionRoleModelMap[SessionRole.Reshape],
      prompt: getReshapePrompt({
        excludedGlobs: [],
        fileCap: REVIEW_FILE_CAP,
        fileCount: REVIEW_FILE_CAP + 1,
        roomFileCount: REVIEW_FILE_CAP,
        sha: oversizedSha,
      }),
    });
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath, "rule", "moves"]);
    const claimedSha = readSha(`${syncedSha}~2`);
    expect(readTrailedShas([claimedSha], EXPRESS_TRAILER, getCwd())).toStrictEqual(new Set([claimedSha]));
    expect(runGit(["diff", queueSha, syncedSha], getCwd())).toBe("");
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    // Counted before the push that carries the parts, so a refusal there costs the reshaper a turn rather than nothing
    expect(runGh.mock.calls.filter(([args]) => args.includes("-f"))).toStrictEqual([
      [
        [
          "api",
          `repos/{owner}/{repo}/commits/${oversizedSha}/comments`,
          "-f",
          `body=${getMarker(RESHAPE_FAILED_MARKER, oversizedSha, [collectorSha])}\nAttempt 1 of ${SESSION_ATTEMPT_CAP}: reshaped ${oversizedSha} into 2 commits`,
        ],
      ],
    ]);
  });

  // A review's fixes lead every window, so a commit that fits the cap alone but not beside them would be held behind
  // Each one while the windows carried nothing but fixes
  test("reshapes a commit that fits the cap alone but not beside the fixes leading the window", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const owingFixesSha = publish(REVIEW_FIXES_BRANCH, commitFile(filePath, ""));
    const fittingSha = commitFiles(overflowPaths.slice(1), "");
    const queueSha = publish(QUEUE_BRANCH, "HEAD");
    runSession.mockResolvedValue({ isEnded: false });

    await expect(
      syncQueue({ ...readBaseInput(), developSha, owingFixesSha, queueSha }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper exited non-zero (attempt 1 of 3 on 952ae52f83e9f5f1f5b08942298f8ea112cfb80e)]`,
    );
    expect(runSession).toHaveBeenCalledExactlyOnceWith({
      cwd: getCwd(),
      model: SessionRoleModelMap[SessionRole.Reshape],
      prompt: getReshapePrompt({
        excludedGlobs: [],
        fileCap: REVIEW_FILE_CAP,
        fileCount: REVIEW_FILE_CAP,
        roomFileCount: REVIEW_FILE_CAP - 1,
        sha: fittingSha,
      }),
    });
  });

  // The bot counts a commit after the base's path filters, so a file under one costs the window nothing: measured raw,
  // This commit is one over the room and would cost a session to repackage what a window already takes whole
  test("leaves unreshaped a commit whose files past the base's path filters fit the room", async () => {
    expect.hasAssertions();

    commitFile(".coderabbit.yaml", 'reviews:\n  path_filters:\n    - "!**/generated/**"\n');
    const developSha = publish(DEVELOP_BRANCH, publish(MAIN_BRANCH, "HEAD"));
    commitFiles([`generated/${TEST_FILENAME}`, ...overflowPaths.slice(1)], "");
    const queueSha = publish(QUEUE_BRANCH, "HEAD");

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runSession).not.toHaveBeenCalled();
  });

  // A window re-cut after the bot kept skipping it is cut to less than the bot's own cap, and its room shrinks with it
  test("reshapes against the cap it is given", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const oversizedSha = commitFiles([filePath, nestedPath], "");
    const queueSha = publish(QUEUE_BRANCH, "HEAD");
    runSession.mockImplementation(() => {
      for (const path of [filePath, nestedPath]) {
        runGit(["checkout", oversizedSha, "--", path], getCwd());
        runGit(["commit", "--quiet", "--message", path], getCwd());
      }
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, fileCap: 1, queueSha });

    assert.exists(syncedSha);
    expect(runSession).toHaveBeenCalledExactlyOnceWith({
      cwd: getCwd(),
      model: SessionRoleModelMap[SessionRole.Reshape],
      prompt: getReshapePrompt({ excludedGlobs: [], fileCap: 1, fileCount: 2, roomFileCount: 1, sha: oversizedSha }),
    });
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([nestedPath, filePath]);
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
      return Promise.resolve({ isEnded: true });
    });
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

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

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).resolves.toBe(queueSha);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("fails the run and counts the attempt when the reshaping leaves a reviewable part over the window's room", async () => {
    expect.hasAssertions();

    const { developSha, oversizedSha, queueSha } = setupOversized();
    runSession.mockImplementation(() => {
      reshape(oversizedSha, 0);
      return Promise.resolve({ isEnded: true });
    });

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left ac5fcce835f2017ec2706c0392acb605ecb8be6f over the window's room without an Express trailer (attempt 1 of 3 on 30e00c79f6d80fba63a7669701f892f6b3cb1a45)]`,
    );
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments",
            "-f",
            "body=<!-- review-collector reshape-failed commit:30e00c79f6d80fba63a7669701f892f6b3cb1a45 against:collectorSha -->
      Attempt 1 of 3 to reshape 30e00c79f6d80fba63a7669701f892f6b3cb1a45 failed — the session left ac5fcce835f2017ec2706c0392acb605ecb8be6f over the window's room without an Express trailer. See the collector run.",
          ],
        ],
      ]
    `);
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
      return Promise.resolve({ isEnded: true });
    });

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left a part naming the copies 30e00c79f6d80fba63a7669701f892f6b3cb1a45 was replayed from (attempt 1 of 3 on 30e00c79f6d80fba63a7669701f892f6b3cb1a45)]`,
    );
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments",
            "-f",
            "body=<!-- review-collector reshape-failed commit:30e00c79f6d80fba63a7669701f892f6b3cb1a45 against:collectorSha -->
      Attempt 1 of 3 to reshape 30e00c79f6d80fba63a7669701f892f6b3cb1a45 failed — the session left a part naming the copies 30e00c79f6d80fba63a7669701f892f6b3cb1a45 was replayed from. See the collector run.",
          ],
        ],
      ]
    `);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  // The session is handed a repackaging, never the cherry-pick this step runs itself, so what it leaves open is
  // Any operation at all — and a restore refuses over one, which would cost the attempt the record that caps it
  test("fails the run and counts the attempt when the reshaping leaves a merge open", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupOversized();
    runSession.mockImplementation(() => {
      const baseSha = readSha("HEAD");
      const theirsSha = commitFile(filePath, queueContent);
      switchTo(baseSha);
      commitFile(filePath, fixContent);
      getResult(() => runGit(["merge", theirsSha], getCwd())).unwrapOr("");
      return Promise.resolve({ isEnded: true });
    });

    await expect(syncQueue({ ...readBaseInput(), developSha, queueSha })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[AttemptFailedError: Invalid operation: Update, name: coderabbit, the reshaper left an operation in progress (attempt 1 of 3 on 30e00c79f6d80fba63a7669701f892f6b3cb1a45)]`,
    );
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments",
            "-f",
            "body=<!-- review-collector reshape-failed commit:30e00c79f6d80fba63a7669701f892f6b3cb1a45 against:collectorSha -->
      Attempt 1 of 3 to reshape 30e00c79f6d80fba63a7669701f892f6b3cb1a45 failed — the session left an operation in progress. See the collector run.",
          ],
        ],
      ]
    `);
    expect(readSha("HEAD")).toBe(queueSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(queueSha);
  });

  // A commit that no longer applies without the parked one goes to the same issue, and what follows both still ports
  test("parks a commit past the reshape attempt cap, with what no longer applies without it, and replays the rest", async () => {
    expect.hasAssertions();

    const developSha = publish(DEVELOP_BRANCH, "HEAD");
    const oversizedSha = commitFiles(overflowPaths, "");
    const dependentSha = commitFile(takeOne(overflowPaths, 0), " ");
    const queueSha = publish(QUEUE_BRANCH, commitFile(filePath, ""));
    mockExhaustedAttempts(RESHAPE_FAILED_MARKER, oversizedSha);
    const syncedSha = await syncQueue({ ...readBaseInput(), developSha, queueSha });

    assert.exists(syncedSha);
    expect(readSha(`origin/${getHeldBranch(oversizedSha)}`)).toBe(oversizedSha);
    expect(readSha(`origin/${getHeldBranch(dependentSha)}`)).toBe(dependentSha);
    expect(readSha(`origin/${QUEUE_BRANCH}`)).toBe(syncedSha);
    expect(readSubjects(`${developSha}..${syncedSha}`)).toStrictEqual([filePath]);
    expect(runGh.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [
            "api",
            "repos/{owner}/{repo}/commits/30e00c79f6d80fba63a7669701f892f6b3cb1a45/comments?per_page=100",
            "--paginate",
            "--slurp",
          ],
        ],
        [
          [
            "issue",
            "list",
            "--state",
            "open",
            "--author",
            "viewerLogin",
            "--label",
            "ready-for-agent",
            "--limit",
            "1000",
            "--json",
            "number,body",
          ],
        ],
        [
          [
            "issue",
            "create",
            "--title",
            "Held: a/0 a/1 a/2 a/3 a/4 a/5 a/6 a/7 a/8 a/9 a/10 a/11 a/12 a/13 a/14 a/15 a/16 a/17 a/18 a/19 a/20 a/21 a/22 a/23 a/24 a/25 a/26 a/27 a/28 a/29 a/30 a/31 a/32 a/33 a/34 a/35 a/36 a/37 a/38 a/39 a/40 a/41 a/42 a/43 a/44 a/45 a/46 a/47 a/48 a/49 a/50 a/51 a/52 a/53 a/54 a/55 a/56 a/57 a/58 a/59 a/60 a/61 a/62 a/63 a/64 a/65 a/66 a/67 a/68 a/69 a/70 a/71 a/72 a/73 a/74 a/75 a/76 a/77 a/78 a/79 a/80 a/81 a/82 a/83 a/84 a/85 a/86 a/87 a/88 a/89 a/90 a/91 a/92 a/93 a/94 a/95 a/96 a/97 a/98 a/99 a/100 a/101 a/102 a/103 a/104 a/105 a/106 a/107 a/108 a/109 a/110 a/111 a/112 a/113 a/114 a/115 a/116 a/117 a/118 a/119 a/120 a/121 a/122 a/123 a/124 a/125 a/126 a/127 a/128 a/129 a/130 a/131 a/132 a/133 a/134 a/135 a/136 a/137 a/138 a/139 a/140 a/141 a/142 a/143 a/144 a/145 a/146 a/147 a/148 a/149 a/150 (2 commits)",
            "--label",
            "ready-for-agent",
            "--body",
            "<!-- review-collector held commit:30e00c79f6d80fba63a7669701f892f6b3cb1a45 -->
      its reshaping under the window's room failed 3 times

      - 30e00c79f6d80fba63a7669701f892f6b3cb1a45 a/0 a/1 a/2 a/3 a/4 a/5 a/6 a/7 a/8 a/9 a/10 a/11 a/12 a/13 a/14 a/15 a/16 a/17 a/18 a/19 a/20 a/21 a/22 a/23 a/24 a/25 a/26 a/27 a/28 a/29 a/30 a/31 a/32 a/33 a/34 a/35 a/36 a/37 a/38 a/39 a/40 a/41 a/42 a/43 a/44 a/45 a/46 a/47 a/48 a/49 a/50 a/51 a/52 a/53 a/54 a/55 a/56 a/57 a/58 a/59 a/60 a/61 a/62 a/63 a/64 a/65 a/66 a/67 a/68 a/69 a/70 a/71 a/72 a/73 a/74 a/75 a/76 a/77 a/78 a/79 a/80 a/81 a/82 a/83 a/84 a/85 a/86 a/87 a/88 a/89 a/90 a/91 a/92 a/93 a/94 a/95 a/96 a/97 a/98 a/99 a/100 a/101 a/102 a/103 a/104 a/105 a/106 a/107 a/108 a/109 a/110 a/111 a/112 a/113 a/114 a/115 a/116 a/117 a/118 a/119 a/120 a/121 a/122 a/123 a/124 a/125 a/126 a/127 a/128 a/129 a/130 a/131 a/132 a/133 a/134 a/135 a/136 a/137 a/138 a/139 a/140 a/141 a/142 a/143 a/144 a/145 a/146 a/147 a/148 a/149 a/150, held on \`ai/held/30e00c79f6\`
      - 71e76ca9ac525b421af70b9e7338a94e2508e11f a/0, held on \`ai/held/71e76ca9ac\`

      To re-land them, on \`ai/queue\`:

      1. \`git fetch origin\`
      2. For each held branch above, in order: \`git cherry-pick --no-commit origin/<branch>\`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, \`git commit -m "<subject>"\` — never the message the pick prepares, nor \`-x\`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted
      3. \`pnpm ai:queue:push\`, after which each new commit ports like any other
      4. \`git push origin --delete <branch>\` for each held branch, then close this issue",
          ],
        ],
      ]
    `);
    expect(runSession).not.toHaveBeenCalled();
  });

  test("reports the reshaping it would do on a dry run", async () => {
    expect.hasAssertions();

    const { developSha, queueSha } = setupOversized();

    await expect(syncQueue({ ...readBaseInput(), developSha, isDryRun: true, queueSha })).resolves.toBe(queueSha);
    expect(runSession).not.toHaveBeenCalled();
  });
});
