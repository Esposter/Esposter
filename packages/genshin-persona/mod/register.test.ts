import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

import { register } from "./register";

const { read, update } = vi.hoisted(() => ({
  read: vi.fn<(_$: unknown, atom: { initial: unknown }) => Promise<unknown>>(),
  update: vi.fn<(_$: unknown, atom: { initial: unknown }, updater: (value: unknown) => unknown) => Promise<unknown>>(),
}));

// The engine's state library is not installed beside the tests, so each atom is its initial value and its reads and
// Writes are spies
vi.mock(import("claude-code"), () => ({ atom: (_key: unknown, initial: unknown) => ({ initial }), read, update }));

// The engine's interface for a session start: each script prints the output it is given, and a timer runs the callback
// It is handed at once
const createEngine = (outputs: { spinner?: string; status: string }, failedScript?: string) => {
  const run = vi.fn<(argv: string[], options?: unknown) => Promise<{ stderr: string; stdout: string }>>((argv) => {
    const script = argv[1] ?? "";
    if (failedScript && script.endsWith(failedScript)) return Promise.reject(new Error("spawn node ENOENT"));
    return Promise.resolve({
      stderr: "",
      stdout: script.endsWith("status.mjs") ? outputs.status : (outputs.spinner ?? ""),
    });
  });
  const $ = {
    clock: {
      after: vi.fn<(ms: number, callback: () => void) => void>((_ms, callback) => {
        callback();
      }),
    },
    command: { register: vi.fn<(command: unknown) => Promise<void>>(() => Promise.resolve()) },
    plugin: { root: "/plugin" },
    process: { run },
    session: { id: vi.fn<() => Promise<string>>(() => Promise.resolve("-1")) },
  };
  return { $, run };
};

// The session start hook, found by its event on the mod's registrations
const startSession = async ($: ReturnType<typeof createEngine>["$"]) => {
  const on = vi.fn<(event: string, ...rest: unknown[]) => void>();
  register(on);
  const sessionStart = on.mock.calls.find(([event]) => event === "session.start")?.at(1);
  assert.isFunction(sessionStart);
  await sessionStart($, {}, (e: unknown) => e);
};

// The refresh runs off the session start's own promise, so one macrotask lets it settle; every step it awaits is a
// Resolved mock, so none of them waits on a timer
const settle = () =>
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

describe(register, () => {
  const onUnhandledRejection = vi.fn<(reason: unknown) => void>();

  beforeEach(() => {
    read.mockImplementation((_$, atom) => Promise.resolve(atom.initial));
    // The engine runs the updater it is given, so a value an updater throws on throws here as it would there
    update.mockImplementation((_$, atom, updater) => Promise.resolve(updater(atom.initial)));
    process.on("unhandledRejection", onUnhandledRejection);
  });

  afterEach(() => {
    process.off("unhandledRejection", onUnhandledRejection);
    vi.clearAllMocks();
  });

  test("a status the script printed that is not JSON resolves and changes no state", async () => {
    expect.hasAssertions();

    const { $, run } = createEngine({ status: "{" });
    await startSession($);
    await settle();

    expect(onUnhandledRejection).not.toHaveBeenCalled();
    expect(run).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
  });

  // A script the node process cannot start rejects its run, which the refresh runs off a timer slot with nothing to
  // Catch it
  test.each(["status.mjs", "spinner.mjs"])(
    "a %s that cannot start resolves rather than rejecting unhandled",
    async (failedScript) => {
      expect.hasAssertions();

      const status = JSON.stringify({ character: { color: "", displayName: "", name: "Keqing" }, isRecorded: true });
      const { $ } = createEngine({ spinner: "", status }, failedScript);
      await startSession($);
      await settle();

      expect(onUnhandledRejection).not.toHaveBeenCalled();
    },
  );

  test("a spinner the script printed that is not JSON resolves and keeps the spinner it had", async () => {
    expect.hasAssertions();

    const status = JSON.stringify({ character: { color: "", displayName: "", name: "Keqing" }, isRecorded: true });
    const { $, run } = createEngine({ spinner: "{", status });
    await startSession($);
    await settle();

    expect(onUnhandledRejection).not.toHaveBeenCalled();
    expect(run).toHaveBeenCalledTimes(2);
    // The record and the character are written; the spinner, whose text did not parse, is not
    expect(update).toHaveBeenCalledTimes(2);
  });
});
