import { claimMachineWatch } from "#src/services/machine/claimMachineWatch";
import {
  EMPTY_LOCK_GRACE_MILLISECONDS,
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
} from "#src/services/machine/constants";
import { releaseMachineWatch } from "#src/services/machine/releaseMachineWatch";
import { mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/constants"), async (importOriginal) => {
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { SITE_NAME } = await import("@esposter/shared");
  const directory = join(tmpdir(), `${SITE_NAME.toLowerCase()}-machine-watch-${process.pid}`);
  return {
    ...(await importOriginal<typeof import("#src/services/machine/constants")>()),
    MACHINE_LOCK_PATH: join(directory, "watcher.lock"),
    MACHINE_LOCK_TAKEOVER_PATH: join(directory, "watcher.lock.takeover"),
    MACHINE_STATE_DIRECTORY: directory,
  };
});

describe(claimMachineWatch, () => {
  const DEAD_PROCESS_ID = 2 ** 30;
  const OTHER_PROCESS_ID = process.ppid;
  const OWN_PROCESS_ID = `${process.pid}`;

  beforeEach(() => {
    mkdirSync(dirname(MACHINE_LOCK_PATH), { recursive: true });
  });

  afterEach(() => {
    rmSync(dirname(MACHINE_LOCK_PATH), { force: true, recursive: true });
  });

  test("claims a machine no watcher holds, with its own process id", () => {
    expect.hasAssertions();

    expect(claimMachineWatch()).toBe(true);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
  });

  test("refuses a machine another live process holds", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, `${OTHER_PROCESS_ID}`);

    expect(claimMachineWatch()).toBe(false);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(`${OTHER_PROCESS_ID}`);
  });

  test("takes over a claim whose process is gone", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, `${DEAD_PROCESS_ID}`);

    expect(claimMachineWatch()).toBe(true);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
  });

  test("leaves a takeover lock another live process holds in place", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, `${DEAD_PROCESS_ID}`);
    writeFileSync(MACHINE_LOCK_TAKEOVER_PATH, `${OTHER_PROCESS_ID}`);

    expect(claimMachineWatch()).toBe(false);
    expect(readFileSync(MACHINE_LOCK_TAKEOVER_PATH, "utf8")).toBe(`${OTHER_PROCESS_ID}`);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(`${DEAD_PROCESS_ID}`);
  });

  test("holds a fresh empty claim whose writer has not yet written its process id in", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, "");

    expect(claimMachineWatch()).toBe(false);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe("");
  });

  test("takes over an empty claim its writer never filled in, once the grace has passed", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, "");
    const pastGrace = new Date(Date.now() - EMPTY_LOCK_GRACE_MILLISECONDS * 2);
    utimesSync(MACHINE_LOCK_PATH, pastGrace, pastGrace);

    expect(claimMachineWatch()).toBe(true);
    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(OWN_PROCESS_ID);
  });

  test("releases only a claim this process holds", () => {
    expect.hasAssertions();

    writeFileSync(MACHINE_LOCK_PATH, `${OTHER_PROCESS_ID}`);
    releaseMachineWatch();

    expect(readFileSync(MACHINE_LOCK_PATH, "utf8")).toBe(`${OTHER_PROCESS_ID}`);
  });
});
