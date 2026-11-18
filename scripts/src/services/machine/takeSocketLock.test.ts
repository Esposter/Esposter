import { takeSocketLock } from "#src/services/machine/takeSocketLock";
import { noop, SITE_NAME } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { once } from "node:events";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe(takeSocketLock, () => {
  const SOCKET_PATH =
    process.platform === "win32"
      ? `\\\\.\\pipe\\${SITE_NAME.toLowerCase()}-take-socket-lock-${process.pid}`
      : join(tmpdir(), `take-socket-lock-${process.pid}.sock`);
  const TAKEOVER_PATH = `${SOCKET_PATH}.takeover`;

  // A child process listening at the path, returned once it is listening
  const startHolder = async () => {
    const holder = spawn(process.execPath, [
      "-e",
      "require('node:net').createServer().listen(process.argv[1], () => console.info('listening'))",
      SOCKET_PATH,
    ]);
    assert.exists(holder.stdout);
    await once(holder.stdout, "data");
    return holder;
  };

  afterEach(() => {
    // A socket a killed holder left is a file on POSIX, which no release of this test's own removes
    if (process.platform !== "win32") {
      rmSync(SOCKET_PATH, { force: true });
      rmSync(TAKEOVER_PATH, { force: true });
    }
    vi.useRealTimers();
  });

  test("waits while another holds the path, announces the wait once, and takes the path when the holder releases", async () => {
    expect.hasAssertions();

    const release = await takeSocketLock(SOCKET_PATH, TAKEOVER_PATH, noop);
    const { promise: announced, resolve: announce } = Promise.withResolvers<void>();
    const onWaiting = vi.fn<() => void>(() => {
      announce();
    });
    const taking = takeSocketLock(SOCKET_PATH, TAKEOVER_PATH, onWaiting);
    await announced;

    release();
    // The release removes its socket file as its server closes, so the waiter finds the path free rather than a dead holder's
    expect(existsSync(SOCKET_PATH)).toBe(false);
    const releaseNext = await taking;

    expect(onWaiting).toHaveBeenCalledExactlyOnceWith();
    releaseNext();
  });

  test("takes a socket file a dead holder left behind, without announcing a wait", async () => {
    expect.hasAssertions();

    const holder = await startHolder();
    holder.kill("SIGKILL");
    await once(holder, "exit");
    const onWaiting = vi.fn<() => void>();

    const release = await takeSocketLock(SOCKET_PATH, TAKEOVER_PATH, onWaiting);

    expect(onWaiting).not.toHaveBeenCalled();
    release();
  });

  // The fake clock leaves no timer to fire, so the take can only come from the holder's close
  test("wakes at once when its holder is killed while it waits, and takes the path over", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    const holder = await startHolder();
    const { promise: announced, resolve: announce } = Promise.withResolvers<void>();
    const onWaiting = vi.fn<() => void>(() => {
      announce();
    });
    const taking = takeSocketLock(SOCKET_PATH, TAKEOVER_PATH, onWaiting);
    await announced;

    holder.kill("SIGKILL");
    await once(holder, "exit");
    const release = await taking;

    expect(onWaiting).toHaveBeenCalledExactlyOnceWith();
    release();
  });
});
