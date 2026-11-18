import {
  INSTALL_LOCK_PATH,
  INSTALL_LOCK_WAITING_MESSAGE,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { takeInstallLock } from "#src/services/machine/takeInstallLock";
import { noop } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { once } from "node:events";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/constants"), async (importOriginal) => {
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { SITE_NAME } = await import("@esposter/shared");
  const directory = join(tmpdir(), `${SITE_NAME.toLowerCase()}-install-lock-${process.pid}`);
  return {
    ...(await importOriginal<typeof import("#src/services/machine/constants")>()),
    INSTALL_LOCK_PATH: join(directory, "install.lock"),
    INSTALL_LOCK_RECHECK_MILLISECONDS: 10,
    INSTALL_LOCK_TAKEOVER_PATH: join(directory, "install.lock.takeover"),
    MACHINE_STATE_DIRECTORY: directory,
  };
});

describe(takeInstallLock, () => {
  const DEAD_PROCESS_ID = 2 ** 30;
  const OTHER_PROCESS_ID = process.ppid;
  const OWN_PROCESS_ID = `${process.pid}`;

  beforeEach(() => {
    mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  });

  afterEach(() => {
    rmSync(MACHINE_STATE_DIRECTORY, { force: true, recursive: true });
    vi.restoreAllMocks();
  });

  test("takes a free lock with its own process id, without announcing a wait", async () => {
    expect.hasAssertions();

    const info = vi.spyOn(console, "info").mockImplementation(noop);

    await takeInstallLock();

    expect(readFileSync(INSTALL_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
    expect(info).not.toHaveBeenCalled();
  });

  test("takes over a lock whose process is gone, without announcing a wait", async () => {
    expect.hasAssertions();

    const info = vi.spyOn(console, "info").mockImplementation(noop);
    writeFileSync(INSTALL_LOCK_PATH, `${DEAD_PROCESS_ID}`);

    await takeInstallLock();

    expect(readFileSync(INSTALL_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
    expect(info).not.toHaveBeenCalled();
  });

  test("waits while another live process holds the lock, and takes it once the holder releases it", async () => {
    expect.hasAssertions();

    const info = vi.spyOn(console, "info").mockImplementation(noop);
    writeFileSync(INSTALL_LOCK_PATH, `${OTHER_PROCESS_ID}`);

    const taking = takeInstallLock();
    // The announcement is made before the wait's first await, so it is read at once
    expect(info).toHaveBeenCalledExactlyOnceWith(INSTALL_LOCK_WAITING_MESSAGE);
    rmSync(INSTALL_LOCK_PATH);
    await taking;

    expect(readFileSync(INSTALL_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
  });

  // A holder killed while another waits removes nothing from the folder, so no event wakes the wait
  // The recheck interval judges the holder instead
  test("takes over a lock whose holder dies while another waits on it", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "info").mockImplementation(noop);
    const holder = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"]);
    assert.exists(holder.pid);
    writeFileSync(INSTALL_LOCK_PATH, `${holder.pid}`);

    const taking = takeInstallLock();
    holder.kill("SIGKILL");
    await once(holder, "exit");
    await taking;

    expect(readFileSync(INSTALL_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
  });
});
