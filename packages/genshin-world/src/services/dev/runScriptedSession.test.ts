import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";
import type { ScriptedSessionOutcome } from "#src/models/dev/ScriptedSessionOutcome";

import { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";
import { SCRIPTED_FRAME_LIMIT, SCRIPTED_SETTLE_MIN_FRAMES } from "#src/services/dev/constants";
import { runScriptedSession } from "#src/services/dev/runScriptedSession";
import { describe, expect, test, vi } from "vitest";

// A driver whose frames, saves and loads do nothing and succeed, and whose registry answers every line with zero unless
// The test gives its own `run`
const createStubDriver = (driver: Partial<ScriptedSessionDriver>): ScriptedSessionDriver => ({
  frame: () => Promise.resolve(),
  load: () => Promise.resolve({ ok: true }),
  run: () => ({ ok: true, value: 0 }),
  save: () => Promise.resolve({ ok: true }),
  ...driver,
});

describe(runScriptedSession, () => {
  test("a failed line stops the script and names it", async () => {
    expect.hasAssertions();

    const refusal: DevResult = { error: " ", ok: false, usage: "heal" };
    const run = vi.fn<(line: string) => DevResult>((line) => (line === "heal" ? refusal : { ok: true, value: 0 }));
    const result = await runScriptedSession(createStubDriver({ run }), ["time", "heal", "state"]);

    expect(result).toStrictEqual({ error: 'step 2: the script stopped at "heal":  ', ok: false, usage: "heal" });
    expect(run.mock.calls).toStrictEqual([["time"], ["heal"]]);
  });

  test("an expect step compares one field of a record exactly", async () => {
    expect.hasAssertions();

    const state = "position=0 place=Windrise hour=0 weather= health=0 party=";
    const result = await runScriptedSession(createStubDriver({ run: () => ({ ok: true, value: state }) }), [
      { equals: "Windrise", field: "place", kind: ScriptedStepKind.Expect, line: "state" },
      { equals: "Liyue", field: "place", kind: ScriptedStepKind.Expect, line: "state" },
    ]);

    expect(result).toStrictEqual({
      error: 'step 2: expect state place: read "Windrise", expected "Liyue"',
      ok: false,
      usage: "",
    });
  });

  test("a step that never settles fails the script", async () => {
    expect.hasAssertions();

    const frame = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const run = vi.fn<(line: string) => DevResult>((line) =>
      line === "settled" ? { ok: true, value: false } : { ok: true, value: 0 },
    );
    const save = vi.fn<() => Promise<ScriptedSessionOutcome>>(() => Promise.resolve({ ok: true }));
    const result = await runScriptedSession(createStubDriver({ frame, run, save }), [
      "time",
      { kind: ScriptedStepKind.Save },
    ]);

    expect(result).toStrictEqual({
      error: `step 1: not settled after ${SCRIPTED_FRAME_LIMIT} frames`,
      ok: false,
      usage: "",
    });
    expect(frame).toHaveBeenCalledTimes(SCRIPTED_FRAME_LIMIT);
    expect(save).not.toHaveBeenCalled();
  });

  test("a line settles the terrain before the next step", async () => {
    expect.hasAssertions();

    const frame = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const run = vi
      .fn<(line: string) => DevResult>()
      .mockReturnValueOnce({ ok: true, value: 0 })
      .mockReturnValueOnce({ ok: true, value: false })
      .mockReturnValueOnce({ ok: true, value: true })
      .mockReturnValueOnce({ ok: true, value: "place=Windrise" });
    const result = await runScriptedSession(createStubDriver({ frame, run }), [
      "time",
      { equals: "Windrise", field: "place", kind: ScriptedStepKind.Expect, line: "state" },
    ]);

    expect(result).toStrictEqual({ ok: true, value: 2 });
    expect(frame).toHaveBeenCalledTimes(SCRIPTED_SETTLE_MIN_FRAMES + 1);
    expect(run.mock.calls).toStrictEqual([["time"], ["settled"], ["settled"], ["state"]]);
  });
});
