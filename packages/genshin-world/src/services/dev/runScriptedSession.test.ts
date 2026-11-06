import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";

import { ScriptedStepKind } from "#src/models/dev/ScriptedStepKind";
import { runScriptedSession } from "#src/services/dev/runScriptedSession";
import { describe, expect, test, vi } from "vitest";

// A driver whose registry answers each line through `run`, and whose frames, saves and loads do nothing and succeed
const createStubDriver = (run: ScriptedSessionDriver["run"]): ScriptedSessionDriver => ({
  frame: () => Promise.resolve(),
  load: () => Promise.resolve({ ok: true }),
  run,
  save: () => ({ ok: true }),
});

describe(runScriptedSession, () => {
  test("A failed line stops the script and names it", async () => {
    expect.hasAssertions();

    const refusal: DevResult = { error: " ", ok: false, usage: "heal" };
    const run = vi.fn<(line: string) => DevResult>((line) => (line === "heal" ? refusal : { ok: true, value: 0 }));
    const result = await runScriptedSession(createStubDriver(run), ["time", "heal", "state"]);

    expect(result).toStrictEqual({ error: 'step 2: the script stopped at "heal":  ', ok: false, usage: "heal" });
    expect(run.mock.calls).toStrictEqual([["time"], ["heal"]]);
  });

  test("An expect step compares one field of a record exactly", async () => {
    expect.hasAssertions();

    const state = "position=0,0,0 place=Windrise hour=21:00 weather=Clear health=100% party=Amber,Kaeya";
    const result = await runScriptedSession(
      createStubDriver(() => ({ ok: true, value: state })),
      [
        { equals: "Windrise", field: "place", kind: ScriptedStepKind.Expect, line: "state" },
        { equals: "Liyue", field: "place", kind: ScriptedStepKind.Expect, line: "state" },
      ],
    );

    expect(result).toStrictEqual({
      error: 'step 2: expect state place: read "Windrise", expected "Liyue"',
      ok: false,
      usage: "",
    });
  });
});
