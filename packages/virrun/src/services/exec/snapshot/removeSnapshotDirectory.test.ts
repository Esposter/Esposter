import type { execFileSync as baseExecFileSync } from "node:child_process";

import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe(removeSnapshotDirectory, () => {
  let dir = "";

  beforeEach(() => {
    vi.clearAllMocks();
    dir = "";
  });

  afterEach(() => {
    if (dir && existsSync(dir)) rmSync(dir, { force: true, recursive: true });
  });

  test("removes a plain directory tree in-process without invoking WSL", () => {
    expect.hasAssertions();

    dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
    mkdirSync(join(dir, "nested"), { recursive: true });
    writeFileSync(join(dir, "nested", "f.txt"), "x");

    removeSnapshotDirectory(dir);

    expect(existsSync(dir)).toBe(false);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("tears down a \\\\wsl.localhost UNC snapshot dir inside WSL via a chmod + rm -rf", () => {
    expect.hasAssertions();

    removeSnapshotDirectory(String.raw`\\wsl.localhost\Ubuntu\home\jimmyc\.virrun\snapshots\h\work.x`);

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", "chmod -R u+rwx '/home/jimmyc/.virrun/snapshots/h/work.x' 2>/dev/null; rm -rf '/home/jimmyc/.virrun/snapshots/h/work.x'"],
      { stdio: "pipe" },
    );
  });

  test("tears down a \\\\wsl$ UNC snapshot dir inside WSL", () => {
    expect.hasAssertions();

    removeSnapshotDirectory(String.raw`\\wsl$\Ubuntu\home\jimmyc\.virrun\snapshots\h\upper.y`);

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", "chmod -R u+rwx '/home/jimmyc/.virrun/snapshots/h/upper.y' 2>/dev/null; rm -rf '/home/jimmyc/.virrun/snapshots/h/upper.y'"],
      { stdio: "pipe" },
    );
  });
});
