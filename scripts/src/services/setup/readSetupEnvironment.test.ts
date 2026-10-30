import { readSetupEnvironment } from "#src/services/setup/readSetupEnvironment";
import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@esposter/shared-node/child-process", () => ({ spawnSync: vi.fn(() => ({ status: 0, stdout: "" })) }));

describe(readSetupEnvironment, () => {
  const PROCESS_OPTIONS = { cwd: REPOSITORY_ROOT, encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES, stdio: "pipe" };
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "setup-environment-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("counts no files at a path that is a regular file, rather than throwing", () => {
    expect.hasAssertions();

    const filePath = join(directory, TEST_FILENAME);
    writeFileSync(filePath, "");

    expect(readSetupEnvironment("darwin").countFiles(filePath)).toBeUndefined();
  });

  test("starts no process while it is built, so a machine without git still gets its table", () => {
    expect.hasAssertions();

    readSetupEnvironment("darwin");

    expect(spawnSync).not.toHaveBeenCalled();
  });

  test("runs a process with its arguments as they are, with no shell, off Windows", () => {
    expect.hasAssertions();

    readSetupEnvironment("darwin").run("git", ["--version"]);

    expect(spawnSync).toHaveBeenCalledExactlyOnceWith("git", ["--version"], PROCESS_OPTIONS);
  });

  test("runs a process through a shell on Windows, quoting a path with a space so it stays one argument", () => {
    expect.hasAssertions();

    readSetupEnvironment("win32").run(String.raw`C:\Program Files\Git\cmd\git.exe`, ["--version"]);

    expect(spawnSync).toHaveBeenCalledExactlyOnceWith(String.raw`"C:\Program Files\Git\cmd\git.exe" "--version"`, {
      ...PROCESS_OPTIONS,
      shell: true,
    });
  });
});
