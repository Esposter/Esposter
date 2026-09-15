import type { spawn as baseSpawn, ChildProcessWithoutNullStreams } from "node:child_process";

import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { EventEmitter } from "node:events";
import { PassThrough, Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

// A session as Claude Code prints it: one JSON event per line, with whatever it says for itself on its way out
// Printed as plain text. `close` is emitted once stdout ends, which is the order the real child fires them in —
// `runDrain` registers its listener before the read loop precisely because that order is this tight.
const mockSession = (exitCode: number, lines: string[]): void => {
  const stdout = Readable.from(lines.map((line) => `${line}\n`));
  const child = Object.assign(new EventEmitter(), { exitCode, stdin: new PassThrough(), stdout });
  stdout.on("end", () => {
    child.emit("close", exitCode);
  });
  spawn.mockReturnValue(child as unknown as ChildProcessWithoutNullStreams);
};

const getAssistantLine = (text: string): string =>
  JSON.stringify({ message: { content: [{ text, type: "text" }] }, type: "assistant" });

const getResultLine = (subtype: string, result: string): string =>
  JSON.stringify({ duration_ms: 1, num_turns: 1, result, subtype, total_cost_usd: 0, type: "result" });

describe(runDrain, () => {
  const REFUSAL_LINE = "You've hit your session limit · resets 3:10am (UTC)";
  // The deadline is read relative to now, so the clock is pinned to the epoch and the reset is an exact
  // Instant rather than merely a present one. Only `Date` is faked: the session is read off a real stream
  const LIMIT_RESET_AT_MS = Temporal.Duration.from({ hours: 3, minutes: 10 }).total("milliseconds");

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A limit is a refusal to *start*, so a session that ran to the end cannot be one — whatever its narration says.
  // The drain is asked to fix findings about this very wording, so its own summary quotes the phrase routinely
  test("reads no limit off a session that ran to the end", async () => {
    expect.hasAssertions();

    mockSession(0, [
      getAssistantLine(`Fixed the ${REFUSAL_LINE} wording in getDrainLimitResetMs.ts.`),
      getResultLine("success", REFUSAL_LINE),
    ]);

    await expect(runDrain("prompt", "")).resolves.toStrictEqual({ isDrained: true, limitResetAtMs: undefined });
  });

  // The model's turns are narration; only what Claude Code says for itself reaches the limit parser, which is
  // What keeps a failed fix's own summary from reading as an outage
  test("reads no limit off the model's narration on a failed session", async () => {
    expect.hasAssertions();

    mockSession(1, [getAssistantLine(REFUSAL_LINE), getResultLine("error_during_execution", "the commit failed")]);

    await expect(runDrain("prompt", "")).resolves.toStrictEqual({ isDrained: false, limitResetAtMs: undefined });
  });

  // The refusal states `success` in the frame it exits non-zero with, so the subtype is no evidence the session
  // Ran — read as a closing message it never reaches the parser, and three pushes during one outage quarantine a
  // Review nobody failed
  test("classifies a refusal wearing a successful subtype as a session limit", async () => {
    expect.hasAssertions();

    mockSession(1, [getResultLine("success", REFUSAL_LINE)]);

    await expect(runDrain("prompt", "")).resolves.toStrictEqual({
      isDrained: false,
      limitResetAtMs: LIMIT_RESET_AT_MS,
    });
  });

  // Claude Code refusing to start writes a sentence rather than JSON, and that sentence is the only thing that
  // States a deadline — so the collector waits it out instead of spending the quarantine budget on an outage
  test("classifies a refusal to start as a session limit", async () => {
    expect.hasAssertions();

    mockSession(1, [REFUSAL_LINE]);

    await expect(runDrain("prompt", "")).resolves.toStrictEqual({
      isDrained: false,
      limitResetAtMs: LIMIT_RESET_AT_MS,
    });
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

    await runDrain("prompt", "");

    const passedEnvironment = spawn.mock.calls[0]?.[2]?.env;
    expect(passedEnvironment?.CLAUDE_CODE_OAUTH_TOKEN).toBe("claude-token");
    expect(passedEnvironment?.PATH).toBe(process.env.PATH);
    expect(passedEnvironment).not.toHaveProperty("GH_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("GITHUB_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("PULUMI_ACCESS_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("AZURE_CLIENT_SECRET");
  });
});
