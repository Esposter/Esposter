import type { EngineInterface } from "claude-code";

import { describe, expect, test, vi } from "vitest";

import { MACHINE_WATCHER_RETRY_MILLISECONDS } from "../constants";
import { watchPulse } from "./watchPulse";

vi.mock(import("claude-code"), () => ({
  /* oxlint-disable-next-line typescript/no-explicit-any -- The engine's atom is a generic overload that no typed mock
     satisfies, and this stub's atom is never read */
  atom: vi.fn<(...args: any[]) => any>(),
  read: vi.fn<() => Promise<{ pulse: boolean }>>(() => Promise.resolve({ pulse: true })),
}));

describe(watchPulse, () => {
  test("arms the retry when the watcher cannot start", async () => {
    expect.hasAssertions();

    const after = vi.fn<(delayMs: number, callback: () => void) => void>();
    const $ = {
      clock: { after },
      fs: { exists: () => Promise.resolve(true) },
      process: {
        spawn: () => ({ [Symbol.asyncIterator]: () => ({ next: () => Promise.reject(new Error("ENOENT")) }) }),
      },
      session: { cwd: () => Promise.resolve("/repo") },
    } as unknown as EngineInterface;

    await watchPulse($);

    expect(after.mock.calls.map(([delayMs]) => delayMs)).toStrictEqual([MACHINE_WATCHER_RETRY_MILLISECONDS]);
  });
});
