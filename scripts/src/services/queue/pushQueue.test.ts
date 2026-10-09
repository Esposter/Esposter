import type { SessionRun } from "#src/models/coderabbit/collect/SessionRun";
import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { QUEUE_BRANCH, SessionRoleModelMap } from "#src/services/coderabbit/collect/constants";
import { setupFixtureRepository } from "#src/services/coderabbit/collect/setupFixtureRepository.test";
import { getCarryPrompt } from "#src/services/queue/getCarryPrompt";
import { pushQueue } from "#src/services/queue/pushQueue";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { runSession } = vi.hoisted(() => ({ runSession: vi.fn<typeof baseRunSession>() }));

// The carry step's session is a headless Claude Code run, which no test starts
vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

// The session settles a stopped pick as its prompt asks: the conflicted path takes the merged content, and the pick
// Is continued into a commit
const settlePick = (cwd: string, path: string, content: string): Promise<SessionRun> => {
  writeFileSync(join(cwd, path), content);
  runGit(["add", path], cwd);
  runGit(["-c", "core.editor=true", "cherry-pick", "--continue"], cwd);
  return Promise.resolve({ isEnded: true, isStarted: true });
};

describe(pushQueue, () => {
  const { commitFile, commitFiles, getCwd, installPreReceiveHook, publish, readSha, switchTo } =
    setupFixtureRepository();
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
  // A conflict on `a`: the remote added it, and the session's commit adds it again with other content. The commit is
  // Titled by the paths it touches, so its subject differs from the remote's and it is not read as a port
  const setupConflict = (localPaths: string[]) => {
    const base = readSha("HEAD");
    publish(QUEUE_BRANCH, commitFile("a", "a"));
    switchTo(base);
    return commitFiles(localPaths, "b");
  };

  beforeEach(() => {
    runSession.mockReset();
  });

  test("pushes over another session's work mid-edit, syncing the branch and keeping that work", async () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readRemoteSubjects().slice(0, 2)).toStrictEqual(["b", "a"]);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("a");
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("carries a commit that landed on the branch while the push ran onto the synced branch", async () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");
    landCommit("landed", "landed");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD~1")).toBe(readSha(remoteQueueRef));
    expect(runGit(["log", "--format=%s", "-1"], getCwd())).toBe("landed\n");
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("a");
  });

  test("carries a commit that landed while a push ahead of the remote ran", async () => {
    expect.hasAssertions();

    publish(QUEUE_BRANCH, readSha("HEAD"));
    const local = commitFile("b", "b");
    landCommit("landed", "landed");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha(remoteQueueRef)).toBe(local);
    expect(readSha("HEAD~1")).toBe(local);
    expect(runGit(["log", "--format=%s", "-1"], getCwd())).toBe("landed\n");
  });

  test("keeps another session's staged work when the push leaves the branch where it stands", async () => {
    expect.hasAssertions();

    publish(QUEUE_BRANCH, readSha("HEAD"));
    commitFile("b", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "staged");
    runGit(["add", ".gitignore"], getCwd());

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(runGit(["status", "--porcelain"], getCwd())).toBe("M  .gitignore\n");
  });

  test("refuses to sync over an uncommitted file the remote changed, leaving the branch where it was", async () => {
    expect.hasAssertions();

    const local = setupMovedRemote(".gitignore", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "dirty");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readRemoteSubjects().slice(0, 2)).toStrictEqual(["b", ".gitignore"]);
    expect(readSha("HEAD")).toBe(local);
    expect(readFileSync(join(getCwd(), ".gitignore"), "utf8")).toBe("dirty");
  });

  test("syncs over an uncommitted edit to a file the remote changed on another line, keeping both", async () => {
    expect.hasAssertions();

    const base = commitFile("roadmap", "1\n2\n3\n4\n5\n");
    publish(QUEUE_BRANCH, commitFile("roadmap", "one\n2\n3\n4\n5\n"));
    switchTo(base);
    commitFile("b", "b");
    writeFileSync(join(getCwd(), "roadmap"), "1\n2\n3\n4\nfive\n");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(readFileSync(join(getCwd(), "roadmap"), "utf8")).toBe("one\n2\n3\n4\nfive\n");
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M roadmap\n");
  });

  test("stops carrying at a landed commit that does not apply, aborting it and keeping the tree clear", async () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "dirty");
    // The remote's `a` and the landed one both add the file, so the pick conflicts
    landCommit("a", "x");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(runGit(["status", "--porcelain"], getCwd())).toBe(" M .gitignore\n");
  });

  test("replays onto the remote over a clean tree, moving the branch onto the replay", async () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(runSession).not.toHaveBeenCalled();
  });

  test("makes the push again when the remote moved during the replay, replaying onto the new tip", async () => {
    expect.hasAssertions();

    setupConflict(["a", "c"]);
    runSession.mockImplementationOnce(({ cwd }) => {
      // Another session's push lands on the remote while this replay is open, after this push fetched the remote
      const remoteTip = readSha(remoteQueueRef);
      const landed = runGit(["commit-tree", `${remoteTip}^{tree}`, "-p", remoteTip, "-m", "landed"], cwd).trim();
      runGit(["push", "--quiet", "origin", `${landed}:refs/heads/${QUEUE_BRANCH}`], getCwd());
      return settlePick(cwd, "a", "a\nb");
    });
    runSession.mockImplementation(({ cwd }) => settlePick(cwd, "a", "a\nb"));

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(runSession).toHaveBeenCalledTimes(2);
    expect(readRemoteSubjects().slice(0, 3)).toStrictEqual(["a c", "landed", "a"]);
    expect(runGit(["show", `${remoteQueueRef}:a`], getCwd())).toBe("a\nb");
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("settles a replayed commit that conflicts through one session, then pushes it", async () => {
    expect.hasAssertions();

    const local = setupConflict(["a", "c"]);
    runSession.mockImplementation(({ cwd }) => settlePick(cwd, "a", "a\nb"));

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(runSession).toHaveBeenCalledTimes(1);

    const [{ cwd, ...options }] = takeOne(runSession.mock.calls);

    expect(cwd).not.toBe(getCwd());
    expect(options).toStrictEqual({
      model: SessionRoleModelMap[SessionRole.Carry],
      prompt: getCarryPrompt(local, ["a"]),
    });
    expect(readRemoteSubjects().slice(0, 2)).toStrictEqual(["a c", "a"]);
    expect(runGit(["show", `${remoteQueueRef}:a`], getCwd())).toBe("a\nb");
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("calls a session once per conflicting commit, carrying on past each one it settles", async () => {
    expect.hasAssertions();

    setupConflict(["a", "c"]);
    commitFiles(["a", "d"], "d");
    runSession.mockImplementation(({ cwd }) => settlePick(cwd, "a", "a\nb\nd"));

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(runSession).toHaveBeenCalledTimes(2);
    expect(readRemoteSubjects().slice(0, 3)).toStrictEqual(["a d", "a c", "a"]);
    expect(runGit(["show", `${remoteQueueRef}:a`], getCwd())).toBe("a\nb\nd");
    expect(readSha("HEAD")).toBe(readSha(remoteQueueRef));
  });

  test("waits, moving nothing, when the session reports a failure", async () => {
    expect.hasAssertions();

    const local = setupConflict(["a", "c"]);
    const remote = readSha(remoteQueueRef);
    runSession.mockResolvedValue({ isEnded: false, isStarted: true });

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Waiting);

    runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], getCwd());

    expect(runSession).toHaveBeenCalledTimes(1);
    expect(readSha(remoteQueueRef)).toBe(remote);
    expect(readSha("HEAD")).toBe(local);
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("waits, moving nothing, when the session exits clean but leaves the pick open", async () => {
    expect.hasAssertions();

    const local = setupConflict(["a", "c"]);
    const remote = readSha(remoteQueueRef);
    runSession.mockResolvedValue({ isEnded: true, isStarted: true });

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Waiting);

    expect(runSession).toHaveBeenCalledTimes(1);
    expect(readSha(remoteQueueRef)).toBe(remote);
    expect(readSha("HEAD")).toBe(local);
    expect(runGit(["worktree", "list"], getCwd()).trim().split("\n")).toHaveLength(1);
  });

  test("removes the worktree when the push is refused", async () => {
    expect.hasAssertions();

    setupMovedRemote("a", "b");
    writeFileSync(join(getCwd(), ".gitignore"), "a");
    runGit(["config", "remote.origin.pushurl", "a"], getCwd());

    await expect(pushQueue(getCwd())).rejects.toThrowErrorMatchingInlineSnapshot(`
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
  test("replays only what was committed since the remote queue was rewritten", async () => {
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

    await expect(pushQueue(getCwd())).resolves.toBe(QueuePushOutcome.Pushed);
    expect(readSha(`${remoteQueueRef}~1`)).toBe(rewritten);
  });
});
