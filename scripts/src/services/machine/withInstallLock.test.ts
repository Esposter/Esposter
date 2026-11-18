import { INSTALL_LOCK_PATH, INSTALL_LOCK_TAKEOVER_PATH } from "#src/services/machine/constants";
import { takeSocketLock } from "#src/services/machine/takeSocketLock";
import { withInstallLock } from "#src/services/machine/withInstallLock";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/constants"), async (importOriginal) => {
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { SITE_NAME } = await import("@esposter/shared");
  const socketPath =
    process.platform === "win32"
      ? `\\\\.\\pipe\\${SITE_NAME.toLowerCase()}-with-install-lock-${process.pid}`
      : join(tmpdir(), `with-install-lock-${process.pid}.sock`);
  return {
    ...(await importOriginal<typeof import("#src/services/machine/constants")>()),
    INSTALL_LOCK_PATH: socketPath,
    INSTALL_LOCK_TAKEOVER_PATH: `${socketPath}.takeover`,
    MACHINE_STATE_DIRECTORY: tmpdir(),
  };
});

describe(withInstallLock, () => {
  afterEach(async () => {
    const { rmSync } = await import("node:fs");
    if (process.platform !== "win32") {
      rmSync(INSTALL_LOCK_PATH, { force: true });
      rmSync(INSTALL_LOCK_TAKEOVER_PATH, { force: true });
    }
  });

  test("holds the lock until its run resolves, so another taker waits for it", async () => {
    expect.hasAssertions();

    const { promise: acquired, resolve: acquire } = Promise.withResolvers<void>();
    const { promise: runEnds, resolve: endRun } = Promise.withResolvers<void>();
    const running = withInstallLock(() => {
      acquire();
      return runEnds;
    });
    await acquired;
    const { promise: waiting, resolve: announce } = Promise.withResolvers<void>();
    const onWaiting = vi.fn<() => void>(() => {
      announce();
    });
    const taking = takeSocketLock(INSTALL_LOCK_PATH, INSTALL_LOCK_TAKEOVER_PATH, onWaiting);
    await waiting;

    endRun();
    await running;
    const release = await taking;

    expect(onWaiting).toHaveBeenCalledExactlyOnceWith();
    release();
  });

  test("releases the lock when its run fails, so the next run takes it", async () => {
    expect.hasAssertions();

    await expect(
      withInstallLock(() => {
        throw new Error(" ");
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    await expect(withInstallLock(() => "next")).resolves.toBe("next");
  });
});
