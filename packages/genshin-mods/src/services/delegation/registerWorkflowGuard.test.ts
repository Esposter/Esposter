import { assert, describe, expect, test, vi } from "vitest";

import type { WorkflowLaunch } from "../../models/WorkflowLaunch";

import { WORKFLOW_MODEL_REFUSAL } from "../constants";
import { registerWorkflowGuard } from "./registerWorkflowGuard";

// The files the guard reads, each as the guard calls them
interface GuardEngine {
  fs: { exists: (path: string) => Promise<boolean>; read: (path: string) => Promise<string> };
}
type Handler = (engine: GuardEngine, launch: WorkflowLaunch, next: Next) => Promise<{ deny?: string }>;
type LetLaunchThrough = (engine: GuardEngine, launch: WorkflowLaunch, next: Next) => { deny?: string };
type Next = (launch: WorkflowLaunch) => { deny?: string };

// The handler the guard registers on `tool.call`, and the catch its registration hands the failure to
const register = (): { handler: Handler; letLaunchThrough: LetLaunchThrough } => {
  const catchHandler = vi.fn<(..._args: unknown[]) => void>();
  const on = vi.fn<(..._args: unknown[]) => { catch: typeof catchHandler }>(() => ({ catch: catchHandler }));
  registerWorkflowGuard(on);
  const handler = on.mock.calls[0]?.[2] as Handler;
  const letLaunchThrough = catchHandler.mock.calls[0]?.[0] as LetLaunchThrough;
  return { handler, letLaunchThrough };
};

// A file is read only once it exists, as the guard does, so a read of one that does not is a test's own mistake
const createEngine = (files: Record<string, string>): GuardEngine => ({
  fs: {
    exists: (path: string) => Promise.resolve(path in files),
    read: (path: string) => {
      const text = files[path];
      assert.exists(text);
      return Promise.resolve(text);
    },
  },
});

describe(registerWorkflowGuard, () => {
  const HAIKU_SCRIPT = "await agent('', { model: 'haiku' });\nawait agent('', { model: 'haiku' });";
  const MIXED_SCRIPT = "await agent('', { model: 'haiku' });\nawait agent('', { model: 'opus' });";

  test("a workflow whose every agent is haiku launches", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    await expect(handler(createEngine({}), { script: HAIKU_SCRIPT }, next)).resolves.toStrictEqual({});
    expect(next).toHaveBeenCalledExactlyOnceWith({ script: HAIKU_SCRIPT });
  });

  test("a haiku-only script at a path launches", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    await expect(
      handler(createEngine({ "/scripts/cleanup.js": HAIKU_SCRIPT }), { scriptPath: "/scripts/cleanup.js" }, next),
    ).resolves.toStrictEqual({});
    expect(next).toHaveBeenCalledExactlyOnceWith({ scriptPath: "/scripts/cleanup.js" });
  });

  test("a workflow with an agent on another model is refused", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    await expect(handler(createEngine({}), { script: MIXED_SCRIPT }, next)).resolves.toStrictEqual({
      deny: WORKFLOW_MODEL_REFUSAL,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("a saved workflow named with no script is refused", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    await expect(handler(createEngine({}), { name: "" }, next)).resolves.toStrictEqual({
      deny: WORKFLOW_MODEL_REFUSAL,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("a script file that is missing is refused", async () => {
    expect.hasAssertions();

    const { handler } = register();
    const next = vi.fn<Next>(() => ({}));

    await expect(handler(createEngine({}), { scriptPath: "/scripts/missing.js" }, next)).resolves.toStrictEqual({
      deny: WORKFLOW_MODEL_REFUSAL,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("lets a launch through when the guard fails", () => {
    expect.hasAssertions();

    const { letLaunchThrough } = register();
    const next = vi.fn<Next>(() => ({}));

    expect(letLaunchThrough(createEngine({}), { script: MIXED_SCRIPT }, next)).toStrictEqual({});
    expect(next).toHaveBeenCalledExactlyOnceWith({ script: MIXED_SCRIPT });
  });
});
