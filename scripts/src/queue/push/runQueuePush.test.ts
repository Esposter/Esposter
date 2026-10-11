import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { markPushPending } from "#src/queue/push/markPushPending";
import { runQueuePush } from "#src/queue/push/runQueuePush";
import { acquireProcessLock } from "#src/services/shared/acquireProcessLock";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(runQueuePush, () => {
  const LOCK_FILE_NAME = "push.lock";
  const PENDING_FILE_NAME = "push.pending";
  const DEAD_PROCESS_ID = 2_000_000_000;
  let directory: string;
  let lockPath: string;
  let pendingPath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "queue-push-"));
    lockPath = join(directory, LOCK_FILE_NAME);
    pendingPath = join(directory, PENDING_FILE_NAME);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("pushes once and leaves neither the lock nor a mark when nothing is running", async () => {
    expect.hasAssertions();

    const push = vi.fn<() => Promise<QueuePushOutcome>>().mockResolvedValue(QueuePushOutcome.Pushed);

    await expect(runQueuePush(push, lockPath, pendingPath)).resolves.toBe(QueuePushOutcome.Pushed);
    expect(push).toHaveBeenCalledExactlyOnceWith();
    expect(acquireProcessLock(lockPath)).toBe(true);
  });

  test("runs once more when a commit lands during the push", async () => {
    expect.hasAssertions();

    const push = vi
      .fn<() => Promise<QueuePushOutcome>>()
      .mockImplementationOnce(() => {
        markPushPending(pendingPath);
        return Promise.resolve(QueuePushOutcome.Pushed);
      })
      .mockResolvedValue(QueuePushOutcome.Pushed);

    await runQueuePush(push, lockPath, pendingPath);
    expect(push).toHaveBeenCalledTimes(2);
    expect(existsSync(pendingPath)).toBe(false);
  });

  test("only marks the commit pending when a live push holds the lock", async () => {
    expect.hasAssertions();

    expect(acquireProcessLock(lockPath)).toBe(true);
    const push = vi.fn<() => Promise<QueuePushOutcome>>().mockResolvedValue(QueuePushOutcome.Pushed);

    await expect(runQueuePush(push, lockPath, pendingPath)).resolves.toBe(QueuePushOutcome.Queued);
    expect(push).not.toHaveBeenCalled();
    expect(existsSync(pendingPath)).toBe(true);
  });

  test("lets go of the lock and throws on when the push rejects", async () => {
    expect.hasAssertions();

    const push = vi.fn<() => Promise<QueuePushOutcome>>().mockRejectedValue(new Error("push failed"));

    await expect(runQueuePush(push, lockPath, pendingPath)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: push failed]`,
    );
    expect(acquireProcessLock(lockPath)).toBe(true);
  });

  test("takes over a lock whose process is gone", async () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(DEAD_PROCESS_ID));
    const push = vi.fn<() => Promise<QueuePushOutcome>>().mockResolvedValue(QueuePushOutcome.Pushed);

    await expect(runQueuePush(push, lockPath, pendingPath)).resolves.toBe(QueuePushOutcome.Pushed);
    expect(push).toHaveBeenCalledExactlyOnceWith();
  });

  test("queues a second push behind the first rather than running it at once", async () => {
    expect.hasAssertions();

    const { promise: isFirstPushReleased, resolve: releaseFirstPush } = Promise.withResolvers<void>();
    const push = vi
      .fn<() => Promise<QueuePushOutcome>>()
      .mockImplementationOnce(async () => {
        await isFirstPushReleased;
        return QueuePushOutcome.Pushed;
      })
      .mockResolvedValue(QueuePushOutcome.Pushed);
    const firstRun = runQueuePush(push, lockPath, pendingPath);
    const secondOutcome = await runQueuePush(push, lockPath, pendingPath);
    releaseFirstPush();

    expect(secondOutcome).toBe(QueuePushOutcome.Queued);
    await expect(firstRun).resolves.toBe(QueuePushOutcome.Pushed);
    expect(push).toHaveBeenCalledTimes(2);
  });
});
