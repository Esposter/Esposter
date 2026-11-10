import type { EngineInterface, On } from "claude-code";

import { beforeEach, describe, expect, test, vi } from "vitest";

import type { WorkflowLaunch } from "../../models/WorkflowLaunch";

import { RESERVE_REFUSAL_INSTRUCTION } from "../constants";
import { getReserveSummary } from "./getReserveSummary";
import { registerReserveGate } from "./registerReserveGate";

// The engine's state, keyed as the gate's atoms are, set per test
const { stateByKey } = vi.hoisted(() => ({ stateByKey: {} as Record<string, unknown> }));

vi.mock("claude-code", () => ({
  atom: ({ key }: { key: string }) => ({ key }),
  read: (_$: unknown, { key }: { key: string }) => Promise.resolve(stateByKey[key]),
}));

type Handler = (engine: EngineInterface, launch: WorkflowLaunch, next: Next) => Promise<{ deny?: string }>;
type LetLaunchThrough = (engine: EngineInterface, launch: WorkflowLaunch, next: Next) => { deny?: string };
type Next = (launch: WorkflowLaunch) => { deny?: string };

// The handler the gate registers on `tool.call`, and the catch its registration hands the failure to
const register = (): { handler: Handler; letLaunchThrough: LetLaunchThrough } => {
  const catchHandler = vi.fn<(..._args: unknown[]) => void>();
  const on = vi.fn<(..._args: unknown[]) => { catch: typeof catchHandler }>(() => ({ catch: catchHandler }));
  registerReserveGate(on as unknown as On);
  const handler = on.mock.calls[0]?.[2] as Handler;
  const letLaunchThrough = catchHandler.mock.calls[0]?.[0] as LetLaunchThrough;
  return { handler, letLaunchThrough };
};

describe("registerReserveGate", () => {
  const NOW = 0;
  const FUTURE_RESET = new Date(60_000).toISOString();
  const PAST_RESET = new Date(-60_000).toISOString();
  const RESERVE_WINDOW = { isAheadOfPace: false, name: "five-hour", percentage: 80, resetsAt: FUTURE_RESET };
  const HAIKU_SCRIPT = "await agent('first', { model: 'haiku' });\nawait agent('second', { model: 'haiku' });";
  const MIXED_SCRIPT = "await agent('first', { model: 'haiku' });\nawait agent('second', { model: 'opus' });";

  const createEngine = (files: Record<string, string>, now = NOW): EngineInterface =>
    ({
      clock: { now: () => Promise.resolve(now) },
      fs: {
        exists: (path: string) => Promise.resolve(path in files),
        read: (path: string) => Promise.resolve(files[path]),
      },
    }) as unknown as EngineInterface;

  const setReserve = (resetsAt = FUTURE_RESET) => {
    stateByKey.enabledMods = { resin: true };
    stateByKey.reserveWindow = { ...RESERVE_WINDOW, resetsAt };
  };
  beforeEach(() => {
    for (const key of Object.keys(stateByKey)) Reflect.deleteProperty(stateByKey, key);
    setReserve();
  });

  test("a workflow pinned to haiku under a reserve", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { script: HAIKU_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ script: HAIKU_SCRIPT });
  });

  test("a haiku-only script at a path under a reserve launches", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(
      await handler(createEngine({ "/scripts/cleanup.js": HAIKU_SCRIPT }), { scriptPath: "/scripts/cleanup.js" }, next),
    ).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ scriptPath: "/scripts/cleanup.js" });
  });

  test("launching a workflow under a reserve", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({
      deny: `${getReserveSummary(RESERVE_WINDOW)}. ${RESERVE_REFUSAL_INSTRUCTION}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("a saved workflow named under a reserve", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { name: "other" }, next)).toStrictEqual({
      deny: `${getReserveSummary(RESERVE_WINDOW)}. ${RESERVE_REFUSAL_INSTRUCTION}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("a script file that is missing under a reserve", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { scriptPath: "/scripts/missing.js" }, next)).toStrictEqual({
      deny: `${getReserveSummary(RESERVE_WINDOW)}. ${RESERVE_REFUSAL_INSTRUCTION}`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("a mixed-model workflow with no reserve holding launches", async () => {
    expect.hasAssertions();

    stateByKey.reserveWindow = { ...RESERVE_WINDOW, name: "" };
    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ script: MIXED_SCRIPT });
  });

  test("a mixed-model workflow with the resin mod off launches", async () => {
    expect.hasAssertions();

    stateByKey.enabledMods = { resin: false };
    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ script: MIXED_SCRIPT });
  });

  test("a mixed-model workflow past its window's reset launches", async () => {
    expect.hasAssertions();

    setReserve(PAST_RESET);
    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(await handler(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ script: MIXED_SCRIPT });
  });

  test("the refusal gate failing", () => {
    expect.hasAssertions();

    const { letLaunchThrough } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(letLaunchThrough(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledWith({ script: MIXED_SCRIPT });
  });
});
