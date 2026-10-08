import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { pushQueue } from "#src/services/queue/pushQueue";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(pushQueue, () => {
  const { commitFile, getCwd, installPreReceiveHook, publish, readSha, switchTo } = setupFixtureRepository();
  const remoteQueueRef = `origin/${QUEUE_BRANCH}`;
  const readRemoteSubjects = () => runGit(["log", "--format=%s", remoteQueueRef], getCwd()).trim().split("\n");
  // The remote queue moves past the base while the session commits on the base: another session's push
  const setupMovedRemote = (remotePath: string, localPath: string) => {
    const base = readSha("HEAD");
    publish(QUEUE_BRANCH, commitFile(remotePath, "a"));
    switchTo(base);
    return commitFile(localPath, "b");
  };
  // Another session commits into this checkout while the remote receives the push. A hook runs in the remote, so it
  // Reaches the checkout by its path, and the variables git hands a hook would point its commands back at the remote
  const landCommit = (path: string, content: string) => {
    installPreReceiveHook(`unset GIT_DIR GIT_QUARANTINE_PATH GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
printf '%s' '${content}' > ../clone/${path}
git -C ../clone add ${path}
git -C ../clone commit --quiet --message ${path}`);
  };

  test("pushes over another session's work mid-edit, syncing the branch and keeping that work", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readRemoteSubjects().slice(0, 2)).toStrictEqual(["b", "a"]);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("a");
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("carries a commit that landed on the branch while the push ran onto the synced branch", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");
    landCommit("landed", "landed");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD~1")).toBe(readSha(remoteQueueRef));
    expect(runGit(["log", "--format=%s", "-1"], getCwd())).toBe("landed\n");
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("a");
  });

  test("carries a commit that landed while a push ahead of the remote ran", () => {
    expect.hasAssertions();

    publish(QUEUE_BRANCH, readSha("HEAD"));
    const local = commitFile("b", "b");
    landCommit("landed", "landed");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readSha(remoteQueueRef)).toBe(local);
    expect(readSha("HEAD~1")).toBe(local);
    expect(runGit(["log", "--format=%s", "-1"], getCwd())).toBe("landed\n");
  });

  test("refuses to sync over an uncommitted file the remote changed, leaving the branch where it was", () => {
    expect.hasAssertions();

    const local = setupMovedRemote(".gitignore", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "dirty");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readRemoteSubjects().slice(0, 2)).toStrictEqual(["b", ".gitignore"]);
    expect(readSha("HEAD")).toBe(local);
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("dirty");
  });

  test("stops carrying at a landed commit that does not apply, aborting it and keeping the tree clear", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "dirty");
    // The remote's `a` and the landed one both add the file, so the pick conflicts
    landCommit("a", "x");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M .gitignore\n");
  });

  test("replays the branch itself over a clean tree", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
  });

  test("waits on a conflict, moving nothing", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "a");
    const remote = readSha(remoteQueueRef);
    writeFileSync(join(getCwd(), ".gitignore"), "a");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Waiting);

    runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], getCwd());

    expect(readSha(remoteQueueRef)).toBe(remote);
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("removes the worktree when the push is refused", () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");
    runGit(["config", "remote.origin.pushurl", "a"], getCwd());

    expect(() => pushQueue(getCwd())).toThrowErrorMatchingInlineSnapshot(`
      [Error: Command failed: git push --quiet origin 626b191178fc0e0d4bf70275d8f2998b1bacc3ce:refs/heads/ai/queue
      fatal: 'a' does not appear to be a git repository
      fatal: Could not read from remote repository.

      Please make sure you have the correct access rights
      and the repository exists.
      ]
    `);
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  // The collector rewrites the queue behind every window, so a commit the session already pushed comes back under
  // Another sha; replaying from the fork point sends only what the session committed since
  test("replays only what was committed since the remote queue was rewritten", () => {
    expect.hasAssertions();

    // Git keeps no reflog entry dated at the epoch itself, and the fork point is read off the reflog
    vi.stubEnv("GIT_COMMITTER_DATE", new Date(1000).toISOString());

    const base = readSha("HEAD");
    const pushed = publish(QUEUE_BRANCH, commitFile("a", "a"));
    switchTo(base);
    const rewritten = commitFile("a", "a2");
    runGit(["push", "--quiet", "--force", "origin", `${rewritten}:refs/heads/${QUEUE_BRANCH}`], getCwd());
    switchTo(pushed);
    commitFile("b", "b");

    expect(pushQueue(getCwd())).toBe(QueuePushOutcome.Pushed);
    expect(readSha(`${remoteQueueRef}~1`)).toBe(rewritten);
  });
});
