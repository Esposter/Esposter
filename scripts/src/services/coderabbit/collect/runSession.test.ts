import type { spawn as baseSpawn, ChildProcessWithoutNullStreams } from "node:child_process";

import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
import { SessionModel } from "#src/models/coderabbit/collect/SessionModel";
import { SESSION_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { EventEmitter } from "node:events";
import { PassThrough, Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

// A session as Claude Code prints it: one JSON event per line, with whatever it says for itself on its way out
// Printed as plain text. `close` is emitted once stdout ends, which is the order the real child fires them in —
// `runSession` registers its listener before the read loop precisely because that order is this tight.
const mockSession = (exitCode: number, lines: string[], pid?: number): void => {
  const stdout = Readable.from(lines.map((line) => `${line}\n`));
  const child = Object.assign(new EventEmitter(), { exitCode, pid, stdin: new PassThrough(), stdout });
  stdout.on("end", () => {
    child.emit("close", exitCode);
  });
  spawn.mockReturnValue(child as unknown as ChildProcessWithoutNullStreams);
};

const getAssistantLine = (text: string): string =>
  JSON.stringify({ message: { content: [{ text, type: "text" }] }, type: "assistant" });

const getResultLine = (subtype: string, result: string): string =>
  JSON.stringify({ duration_ms: 1, num_turns: 1, result, subtype, total_cost_usd: 0, type: "result" });

describe(runSession, () => {
  const REFUSAL_LINE = "You've hit your session limit · resets 3:10am (UTC)";
  // The deadline is read relative to now, so the clock is pinned to the epoch and the reset is an exact
  // Instant rather than merely a present one. Only `Date` is faked: the session is read off a real stream
  const LIMIT_RESET_AT_MS = Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds");
  // Past every platform's pid range, so a kill that reached the real call would signal nothing
  const pid = 2 ** 22;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // A limit is a refusal to *start*, so a session that ran to the end cannot be one — whatever its narration says.
  // The drain is asked to fix findings about this very wording, so its own summary quotes the phrase routinely
  test("reads no limit off a session that ran to the end", async () => {
    expect.hasAssertions();

    mockSession(0, [
      getAssistantLine(`Fixed the ${REFUSAL_LINE} wording in getSessionLimitResetMs.ts.`),
      getResultLine("success", REFUSAL_LINE),
    ]);

    await expect(runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" })).resolves.toStrictEqual({
      isEnded: true,
    });
  });

  // The model's turns are narration; only what Claude Code says for itself reaches the limit parser, which is
  // What keeps a failed fix's own summary from reading as an outage
  test("reads no limit off the model's narration on a failed session", async () => {
    expect.hasAssertions();

    mockSession(1, [getAssistantLine(REFUSAL_LINE), getResultLine("error_during_execution", "the commit failed")]);

    await expect(runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" })).resolves.toStrictEqual({
      isEnded: false,
    });
  });

  // The refusal states `success` in the frame it exits non-zero with, so the subtype is no evidence the session
  // Ran — read as a closing message it never reaches the parser, and three pushes during one outage hold a
  // Review nobody failed
  test("classifies a refusal wearing a successful subtype as a session limit", async () => {
    expect.hasAssertions();

    mockSession(1, [getResultLine("success", REFUSAL_LINE)]);

    await expect(runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" })).rejects.toStrictEqual(
      new SessionLimitedError(LIMIT_RESET_AT_MS),
    );
  });

  // Claude Code refusing to start writes a sentence rather than JSON, and that sentence is the only thing that
  // States a deadline — so the collector waits it out instead of spending the attempt cap on an outage
  test("classifies a refusal to start as a session limit", async () => {
    expect.hasAssertions();

    mockSession(1, [REFUSAL_LINE]);

    await expect(runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" })).rejects.toStrictEqual(
      new SessionLimitedError(LIMIT_RESET_AT_MS),
    );
  });

  // `pnpm` refusing to launch the session — a conflicted `pnpm-workspace.yaml` is one such refusal, and it is
  // Exactly the tree the resolver is handed — writes to stderr and leaves the stream empty. Thrown, it takes the one
  // Path every step shares; returned, each step had to tell it from an attempt on its own
  test("throws for a launch that wrote nothing as a session that never started", async () => {
    expect.hasAssertions();

    mockSession(1, []);

    await expect(
      runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SessionUnstartedError: Invalid operation: Read, name: coderabbit, no session started - the launch wrote nothing]`,
    );
  });

  // A session that lost its way is bounded by its own wall clock rather than the job's, and the kill names the group:
  // `pnpm` alone dying would leave the session it launched writing the checkout after the collector moved on. The
  // Session has written a line, so it started, and the kill reads as an attempt that did not end clean
  test.skipIf(process.platform === "win32")("kills a session past its deadline and reads it as not ended", async () => {
    expect.hasAssertions();

    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    const stdout = new PassThrough();
    const child = Object.assign(new EventEmitter(), { exitCode: null, pid, stdin: new PassThrough(), stdout });
    spawn.mockReturnValue(child as unknown as ChildProcessWithoutNullStreams);
    // The group's death is what closes the real child, and its stdout never ends before then
    const kill = vi.spyOn(process, "kill").mockImplementation(() => {
      child.emit("close", null, "SIGKILL");
      return true;
    });
    // The session's first line is logged once the read loop has it, which is the instant the session has started
    const { promise: isLineRead, resolve } = Promise.withResolvers<void>();
    vi.spyOn(console, "info").mockImplementation(() => {
      resolve();
    });
    const run = runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" });
    stdout.write(`${getAssistantLine("a")}\n`);
    await isLineRead;
    controller.abort();

    await expect(run).resolves.toStrictEqual({ isEnded: false });
    expect(timeout).toHaveBeenCalledExactlyOnceWith(SESSION_TIMEOUT_MS);
    expect(kill).toHaveBeenCalledExactlyOnceWith(-pid, "SIGKILL");
  });

  // The clock runs on after the session it bounds, and a group's id is free for reuse once its leader is gone: a kill
  // Fired then would end whatever the system handed that id next
  test.skipIf(process.platform === "win32")("kills nothing once the session has closed", async () => {
    expect.hasAssertions();

    const controller = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    const kill = vi.spyOn(process, "kill").mockReturnValue(true);
    mockSession(0, [getResultLine("success", "")], pid);
    await runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" });
    controller.abort();

    expect(kill).not.toHaveBeenCalled();
  });

  // A denylist of two names only ever protects what it already knew to name — this job's own environment grows
  // Secrets over time (`run-review-collector.yaml`), and every future one would reach the sandbox unless someone
  // Remembered to add it here by hand. Secret-shaped names are withheld instead, whatever they are called,
  // Except the one credential the drain is deliberately given to authenticate `claude` itself
  test("withholds every secret-shaped variable except the one the drain needs to run", async () => {
    expect.hasAssertions();

    vi.stubEnv("GH_TOKEN", "gh-token");
    vi.stubEnv("GITHUB_TOKEN", "github-token");
    vi.stubEnv("PULUMI_ACCESS_TOKEN", "pulumi-token");
    vi.stubEnv("AZURE_CLIENT_SECRET", "azure-secret");
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "claude-token");
    mockSession(0, [getResultLine("success", "done")]);

    await runSession({ cwd: "", model: SessionModel.Opus, prompt: "prompt" });

    const passedEnvironment = spawn.mock.calls[0]?.[2]?.env;
    expect(passedEnvironment?.CLAUDE_CODE_OAUTH_TOKEN).toBe("claude-token");
    expect(passedEnvironment?.PATH).toBe(process.env.PATH);
    expect(passedEnvironment).not.toHaveProperty("GH_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("GITHUB_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("PULUMI_ACCESS_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("AZURE_CLIENT_SECRET");
  });
});
