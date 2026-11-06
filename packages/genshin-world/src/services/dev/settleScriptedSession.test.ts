import type { DevResult } from "#src/models/dev/DevResult";
import type { ScriptedSessionDriver } from "#src/models/dev/ScriptedSessionDriver";

import { SCRIPTED_SETTLE_MIN_FRAMES } from "#src/services/dev/constants";
import { settleScriptedSession } from "#src/services/dev/settleScriptedSession";
import { describe, expect, test, vi } from "vitest";

describe(settleScriptedSession, () => {
  test("a settle waits the frames a view change needs before its first read", async () => {
    expect.hasAssertions();

    // The view answers from its old selection, which reads settled, until a frame has run the selection on the new view.
    // The frame after that the new view's tiles are asked for and not given yet, and from the next frame on they are
    let framesSinceLine = 0;
    const readsAtFrames: number[] = [];
    const driver: ScriptedSessionDriver = {
      frame: vi.fn<() => Promise<void>>(() => {
        framesSinceLine += 1;
        return Promise.resolve();
      }),
      load: () => Promise.resolve({ ok: true }),
      run: vi.fn<(line: string) => DevResult>((line) => {
        if (line !== "settled") {
          framesSinceLine = 0;
          return { ok: true, value: 0 };
        }

        readsAtFrames.push(framesSinceLine);
        return { ok: true, value: framesSinceLine !== 1 };
      }),
      save: () => Promise.resolve({ ok: true }),
    };
    driver.run("teleport");
    const outcome = await settleScriptedSession(driver);

    expect({ outcome, readsAtFrames }).toStrictEqual({
      outcome: { ok: true },
      readsAtFrames: [SCRIPTED_SETTLE_MIN_FRAMES],
    });
  });
});
