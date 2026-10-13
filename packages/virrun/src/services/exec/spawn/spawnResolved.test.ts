import type { resolveCmdCommand as baseResolveCmdCommand } from "#src/services/exec/spawn/resolveCmdCommand";
import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { CommandNotFoundError } from "#src/models/exec/spawn/CommandNotFoundError";
import { spawnResolved } from "#src/services/exec/spawn/spawnResolved";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { resolveCmdCommand, spawn } = vi.hoisted(() => ({
  resolveCmdCommand: vi.fn<typeof baseResolveCmdCommand>(),
  spawn: vi.fn<typeof baseSpawn>(),
}));

vi.mock(import("#src/services/exec/spawn/resolveCmdCommand"), () => ({
  resolveCmdCommand: resolveCmdCommand as unknown as typeof baseResolveCmdCommand,
}));
vi.mock(import("@esposter/shared-node/child-process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

const createChild = (): ChildProcess => new EventEmitter() as unknown as ChildProcess;

describe(spawnResolved, () => {
  const COMMAND = "pnpm";
  const ARGUMENTS = ["install", "a&b"];
  // Each argument is quoted and escaped twice, as the batch file's own line re-parses it
  const ESCAPED_ARGUMENTS = '^^^"install^^^" ^^^"a^^^&b^^^"';
  const COMSPEC = String.raw`C:\Windows\System32\cmd.exe`;
  const RESOLVED_EXECUTABLE = String.raw`C:\nodejs\node.exe`;
  const RESOLVED_BATCH_FILE = String.raw`C:\tools\pnpm.CMD`;
  const stubPlatform = setupPlatformStub();

  beforeEach(() => {
    resolveCmdCommand.mockReset();
    spawn.mockReset();
    spawn.mockReturnValue(createChild());
    vi.stubEnv("comspec", COMSPEC);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("spawns a command unchanged off win32, where node runs it without a shell", () => {
    expect.hasAssertions();

    stubPlatform("linux");

    spawnResolved(COMMAND, ARGUMENTS, { stdio: "ignore" });

    expect(resolveCmdCommand).not.toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledExactlyOnceWith(COMMAND, ARGUMENTS, { stdio: "ignore" });
  });

  test("runs a resolved .exe directly on win32", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(RESOLVED_EXECUTABLE);

    spawnResolved("node", ARGUMENTS, {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(RESOLVED_EXECUTABLE, ARGUMENTS, {});
  });

  // Regression for PR #158 (cmd-shim outside node_modules/.bin): a batch file re-parses its `%*` wherever it lives, so
  // Its arguments are escaped twice whether or not a `node_modules/.bin` path says it is an npm shim. Upstream escapes
  // Once for a file outside that path.
  test("#158 runs a resolved batch file through cmd.exe with each argument escaped twice", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(RESOLVED_BATCH_FILE);

    spawnResolved(COMMAND, ARGUMENTS, {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      COMSPEC,
      ["/d", "/s", "/c", `"C:\\tools\\pnpm.CMD ${ESCAPED_ARGUMENTS}"`],
      { windowsVerbatimArguments: true },
    );
  });

  // Regression for issue #9 (a space in the path): the command is one word, caret-escaped, so cmd.exe does not split it
  test("#9 caret-escapes a command path with a space so it stays one word", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(String.raw`C:\Program Files\pnpm\pnpm.CMD`);

    spawnResolved(COMMAND, [], {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      COMSPEC,
      ["/d", "/s", "/c", String.raw`"C:\Program^ Files\pnpm\pnpm.CMD"`],
      { windowsVerbatimArguments: true },
    );
  });

  // Regression for issue #150: a command name is one word on the cmd.exe line, so `echo foo bar` is not the echo builtin
  test("#150 keeps a command name with spaces one word, not the cmd.exe builtin it spells", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    spawnResolved("echo foo bar", [], {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(COMSPEC, ["/d", "/s", "/c", '"echo^ foo^ bar"'], {
      windowsVerbatimArguments: true,
    });
  });

  test("runs an unresolved command through cmd.exe, which reports it not found", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    spawnResolved(COMMAND, ARGUMENTS, {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(COMSPEC, ["/d", "/s", "/c", `"${COMMAND} ${ESCAPED_ARGUMENTS}"`], {
      windowsVerbatimArguments: true,
    });
  });

  // Cmd.exe exits 1 for a command it cannot find, which reads as the ENOENT node reports for a missing executable
  test("reports a command found nowhere as ENOENT when cmd.exe exits 1", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    const child = createChild();
    const onError = vi.fn<(error: CommandNotFoundError) => void>();
    spawn.mockReturnValue(child);
    child.on("error", onError);

    spawnResolved(COMMAND, ARGUMENTS, {});
    child.emit("exit", 1);

    expect(onError).toHaveBeenCalledExactlyOnceWith(new CommandNotFoundError("spawn", COMMAND, ARGUMENTS));
  });

  test("leaves an exit 1 of a resolved command as the command's own exit", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(RESOLVED_BATCH_FILE);
    const child = createChild();
    const onError = vi.fn<(error: CommandNotFoundError) => void>();
    spawn.mockReturnValue(child);
    child.on("error", onError);

    spawnResolved(COMMAND, ARGUMENTS, {});
    child.emit("exit", 1);

    expect(onError).not.toHaveBeenCalled();
  });

  // Regression: the refusal sat on every win32 argv, so `wsl.exe --exec sh -c '<multi-line script>'` — the whole WSL
  // Sandbox — was refused although an .exe receives its argv as data and no cmd.exe ever parses it
  test("passes a line break and a percent sign to a resolved .exe, which no cmd.exe parses", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(RESOLVED_EXECUTABLE);

    spawnResolved("node", ["\n%path%"], {});

    expect(spawn).toHaveBeenCalledExactlyOnceWith(RESOLVED_EXECUTABLE, ["\n%path%"], {});
  });

  // Cmd.exe ends the command at a bare line break even inside quotes, so the rest would run as a second command
  test("#179 refuses a line break in an argument bound for cmd.exe", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    resolveCmdCommand.mockReturnValue(RESOLVED_BATCH_FILE);

    expect(() => spawnResolved(COMMAND, ["\n"], {})).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: pnpm, a cmd.exe argv cannot carry a line break or a percent sign]`,
    );
    expect(spawn).not.toHaveBeenCalled();
  });

  // Regression for BatBadBut (https://github.com/moxystudio/node-cross-spawn/issues/171): a `%name%` argument is
  // Expanded by cmd.exe from an environment variable whose name the caret escaping itself spells, so cross-spawn's
  // Escaping cannot make it data. Upstream spawns it anyway; this refuses it.
  test("#171 refuses a percent sign in an argument bound for cmd.exe, which expands it as an environment variable", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    expect(() => spawnResolved(COMMAND, ["%path%"], {})).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: pnpm, a cmd.exe argv cannot carry a line break or a percent sign]`,
    );
    expect(spawn).not.toHaveBeenCalled();
  });
});
