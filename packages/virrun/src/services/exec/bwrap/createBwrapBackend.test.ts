// oxlint-disable vitest/prefer-mock-return-shorthand -- the fake child replays its streams on a microtask
// Scheduled at creation, so it must be created lazily inside the mock — an eager `mockReturnValue(createFakeChild(...))`
// Would fire the events before `exec` attaches its listeners.
import type { ExecStdio, ExecTeeTarget } from "@/models/exec/ExecOptions";
import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import {
  WSL_BWRAP_STATUS_BEGIN,
  WSL_BWRAP_STATUS_END,
  WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER,
} from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
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
  const exec = (stdio: ExecStdio, tee?: ExecTeeTarget) => createBackend().exec(["tsgo"], { cwd: "", stdio, tee });

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
      ({ message: errorMessage }) => errorMessage,
    );

    expect(message).toBe(
      `Invalid operation: Create, name: ${ERROR_NAME}, bubblewrap failed to set up the sandbox\n${commandStderr}`,
    );
  });

  test("names a folded sync failure instead of blaming bubblewrap when its marker is in stderr", async () => {
    expect.hasAssertions();

    // The wsl backend's sync prelude failed before bwrap started: no status block, only the marker line.
    const commandStderr = `${WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER} with exit code 1\n`;
    spawn.mockImplementation(() => createFakeChild({ stderr: commandStderr }));
    const message = (await getResultAsync(() => exec("pipe"))).match(
      () => "",
      ({ message: errorMessage }) => errorMessage,
    );

    expect(message).toBe(
      `Invalid operation: Create, name: ${ERROR_NAME}, the source mirror sync failed before the sandbox started\n${commandStderr}`,
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

  test("streams stderr to the host live across chunks under inherit, withholding the split status marker", async () => {
    expect.hasAssertions();

    const firstChunk = "resolving\n";
    const secondChunk = "downloading\n";
    const trailer = `${WSL_BWRAP_STATUS_BEGIN}{"exit-code":0}\n${WSL_BWRAP_STATUS_END}`;
    // Cut inside the BEGIN marker (< marker length into the trailer) so it genuinely spans two chunks.
    const splitIndex = firstChunk.length + secondChunk.length + Math.floor(WSL_BWRAP_STATUS_BEGIN.length / 2);
    const fullStderr = `${firstChunk}${secondChunk}${trailer}`;
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    spawn.mockImplementation(() => {
      const child = new EventEmitter();
      const stderrStream = new EventEmitter();
      Object.assign(child, { stderr: stderrStream, stdio: [null, null, stderrStream], stdout: null });
      queueMicrotask(() => {
        stderrStream.emit("data", Buffer.from(firstChunk));
        stderrStream.emit("data", Buffer.from(secondChunk));
        // The status marker is split mid-marker across two chunks; neither half may leak to the host.
        stderrStream.emit("data", Buffer.from(fullStderr.slice(firstChunk.length + secondChunk.length, splitIndex)));
        stderrStream.emit("data", Buffer.from(fullStderr.slice(splitIndex)));
        child.emit("close");
      });
      return child as unknown as ChildProcess;
    });
    const { exitCode } = await exec("inherit");

    expect(exitCode).toBe(0);
    expect(write.mock.calls.map(([chunk]) => chunk).join("")).toBe(`${firstChunk}${secondChunk}`);
  });

  test("never tears a line mid-word under inherit — flushes on newline boundaries, not arbitrary bytes", async () => {
    expect.hasAssertions();

    // A single line longer than the marker holdback, split before its trailing newline so the first chunk carries
    // No newline: the old byte-boundary flush would surface the leading fragment, while the line-aligned writer
    // Holds it until the second chunk completes the line. Sizing off the marker length keeps the "exceeds the
    // Holdback" intent self-documenting instead of a magic width.
    const line = `${TEST_FILENAME.repeat(WSL_BWRAP_STATUS_BEGIN.length)}\n`;
    const splitIndex = WSL_BWRAP_STATUS_BEGIN.length;
    const trailer = `${WSL_BWRAP_STATUS_BEGIN}{"exit-code":0}\n${WSL_BWRAP_STATUS_END}`;
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    spawn.mockImplementation(() => {
      const child = new EventEmitter();
      const stderrStream = new EventEmitter();
      Object.assign(child, { stderr: stderrStream, stdio: [null, null, stderrStream], stdout: null });
      queueMicrotask(() => {
        stderrStream.emit("data", Buffer.from(line.slice(0, splitIndex)));
        stderrStream.emit("data", Buffer.from(line.slice(splitIndex)));
        stderrStream.emit("data", Buffer.from(trailer));
        child.emit("close");
      });
      return child as unknown as ChildProcess;
    });
    const { exitCode } = await exec("inherit");

    expect(exitCode).toBe(0);

    // Every flushed chunk ends on a newline — the line is never surfaced half-written.
    for (const [chunk] of write.mock.calls) expect(String(chunk).endsWith("\n")).toBe(true);

    expect(write.mock.calls.map(([chunk]) => chunk).join("")).toBe(line);
  });

  // One case per tee target: the child's stdout must land ONLY on the declared host stream (provisioning tees to
  // Stderr so a piped caller's stdout — e.g. `virrun -- depcruise | dot` — is never poisoned; the task cache's miss
  // Path tees to stdout) while the result still captures it for recording.
  test.each<ExecTeeTarget>(["stderr", "stdout"])(
    "tees the child's stdout live to host %s only under pipe while still capturing it",
    async (teeTarget) => {
      expect.hasAssertions();

      const commandStdout = "digraph {}\n";
      const writes = {
        stderr: vi.spyOn(process.stderr, "write").mockReturnValue(true),
        stdout: vi.spyOn(process.stdout, "write").mockReturnValue(true),
      };
      spawn.mockImplementation(() =>
        createFakeChild({
          stderr: `${WSL_BWRAP_STATUS_BEGIN}{"exit-code":0}\n${WSL_BWRAP_STATUS_END}`,
          stdout: commandStdout,
        }),
      );
      const { exitCode, stdout } = await exec("pipe", teeTarget);

      expect(exitCode).toBe(0);
      expect(stdout).toBe(commandStdout);
      expect(writes[teeTarget]).toHaveBeenCalledExactlyOnceWith(commandStdout);
      expect(writes[teeTarget === "stderr" ? "stdout" : "stderr"]).not.toHaveBeenCalled();
    },
  );

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
