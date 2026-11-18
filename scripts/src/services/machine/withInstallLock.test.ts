import { INSTALL_LOCK_PATH, MACHINE_STATE_DIRECTORY } from "#src/services/machine/constants";
import { withInstallLock } from "#src/services/machine/withInstallLock";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/constants"), async (importOriginal) => {
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { SITE_NAME } = await import("@esposter/shared");
  const directory = join(tmpdir(), `${SITE_NAME.toLowerCase()}-with-install-lock-${process.pid}`);
  return {
    ...(await importOriginal<typeof import("#src/services/machine/constants")>()),
    INSTALL_LOCK_PATH: join(directory, "install.lock"),
    INSTALL_LOCK_TAKEOVER_PATH: join(directory, "install.lock.takeover"),
    MACHINE_STATE_DIRECTORY: directory,
  };
});

describe(withInstallLock, () => {
  const OWN_PROCESS_ID = `${process.pid}`;

  beforeEach(() => {
    mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  });

  afterEach(() => {
    rmSync(MACHINE_STATE_DIRECTORY, { force: true, recursive: true });
  });

  test("holds the lock while its run goes, and releases it once the run resolves", async () => {
    expect.hasAssertions();

    const heldDuringRun = await withInstallLock(() => readFileSync(INSTALL_LOCK_PATH, "utf8"));

    expect(heldDuringRun).toBe(OWN_PROCESS_ID);
    expect(existsSync(INSTALL_LOCK_PATH)).toBe(false);
  });

  test("releases the lock when its run fails, and rethrows the failure", async () => {
    expect.hasAssertions();

    await expect(
      withInstallLock(() => {
        throw new Error(" ");
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(existsSync(INSTALL_LOCK_PATH)).toBe(false);
  });
});
