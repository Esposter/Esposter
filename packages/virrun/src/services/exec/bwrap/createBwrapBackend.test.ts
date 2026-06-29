import type { ExecStdio } from "@/models/exec/ExecOptions";
import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { getResultAsync } from "@esposter/shared";
import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// The wsl backend can't let stderr stream live — it carries the bwrap status block it has to parse — so it
// Captures stderr regardless of stdio. These cases pin down that the captured stderr is never swallowed:
// It must surface in the sandbox-setup error, and under "inherit" it must be re-emitted to the host.
const ERROR_NAME = "createOsBackend";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

// A minimal ChildProcess stand-in that replays the given stream chunks then closes, so the close handler
// Runs against deterministic stdout/stderr/status without spawning a real wsl/bwrap process.
const createFakeChild = ({ status = "", stderr = "", stdout = "" }): ChildProcess => {
  const child = new EventEmitter();
  const stdoutStream = new EventEmitter();
  const stderrStream = new EventEmitter();
  const statusStream = new EventEmitter();
  Object.assign(child, {
    stderr: stderrStream,
    stdio: [null, stdoutStream, stderrStream, statusStream],
    stdout: stdoutStream,
  });
  queueMicrotask(() => {
    if (stdout) stdoutStream.emit("data", Buffer.from(stdout));
    if (stderr) stderrStream.emit("data", Buffer.from(stderr));
    if (status) statusStream.emit("data", Buffer.from(status));
    child.emit("close");
  });
  return child as unknown as ChildProcess;
};

describe(createBwrapBackend, () => {
  const createBackend = () =>
    createBwrapBackend(
      () => [],
      () => ({ command: ["wsl.exe"], env: {}, statusSource: "stderr" }),
      ERROR_NAME,
    );
  const exec = (stdio: ExecStdio) => createBackend().exec(["tsgo"], { cwd: "", stdio });

  beforeEach(() => {
    spawn.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("folds the captured stderr into the sandbox-setup error when no exit code is reported", async () => {
    expect.hasAssertions();

    const commandStderr = "bwrap: execvp tsgo: No such file or directory\n";
    spawn.mockImplementation(() => createFakeChild({ stderr: commandStderr }));
    const message = (await getResultAsync(() => exec("pipe"))).match(
      () => "",
      ({ message }) => message,
    );

    expect(message).toBe(
      `Invalid operation: Create, name: ${ERROR_NAME}, bubblewrap failed to set up the sandbox\n${commandStderr}`,
    );
  });

  test("re-emits the cleaned stderr to the host under inherit and leaves the result streams empty", async () => {
    expect.hasAssertions();

    const commandStderr = "type error\n";
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    spawn.mockImplementation(() =>
      createFakeChild({ stderr: `${commandStderr}${WSL_BWRAP_STATUS_BEGIN}{"exit-code":1}\n${WSL_BWRAP_STATUS_END}` }),
    );
    const { exitCode, stderr, stdout } = await exec("inherit");

    expect(exitCode).toBe(1);
    expect(stderr).toBe("");
    expect(stdout).toBe("");
    expect(write).toHaveBeenCalledExactlyOnceWith(commandStderr);
  });

  test("returns the cleaned stderr in the result under pipe without writing to the host", async () => {
    expect.hasAssertions();

    const commandStderr = "type error\n";
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    spawn.mockImplementation(() =>
      createFakeChild({ stderr: `${commandStderr}${WSL_BWRAP_STATUS_BEGIN}{"exit-code":1}\n${WSL_BWRAP_STATUS_END}` }),
    );
    const { exitCode, stderr } = await exec("pipe");

    expect(exitCode).toBe(1);
    expect(stderr).toBe(commandStderr);
    expect(write).not.toHaveBeenCalled();
  });
});
