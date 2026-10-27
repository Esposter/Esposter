import { createHookRegistry } from "@/services/shared/createHookRegistry";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createHookRegistry, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("does not register on the server", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", undefined);
    const registry = createHookRegistry<(value: number) => void>();
    const hook = vi.fn<(value: number) => void>();
    registry.register(hook);
    await registry.run(0);

    expect(registry.hooks).toHaveLength(0);
    expect(hook).not.toHaveBeenCalled();
  });

  test("registers and runs on the client", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", {});
    const registry = createHookRegistry<(value: number) => void>();
    const hook = vi.fn<(value: number) => void>();
    registry.register(hook);
    await registry.run(0);

    expect(hook).toHaveBeenCalledExactlyOnceWith(0);
  });

  // A hook registered from a blade's scope outlives it otherwise — the registry is module-scoped, so a remount
  // Would stack a second copy over the editor the first one holds
  test("unregisters a hook", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", {});
    const registry = createHookRegistry<(value: number) => void>();
    const hook = vi.fn<(value: number) => void>();
    registry.register(hook)();
    await registry.run(0);

    expect(registry.hooks).toHaveLength(0);
    expect(hook).not.toHaveBeenCalled();
  });

  // Unregistering twice must leave the other hooks alone: with the index missing, `splice(-1, 1)` would drop the last one
  test("unregisters only its own hook when called twice", async () => {
    expect.hasAssertions();

    vi.stubGlobal("window", {});
    const registry = createHookRegistry<(value: number) => void>();
    const firstHook = vi.fn<(value: number) => void>();
    const secondHook = vi.fn<(value: number) => void>();
    const unregisterFirst = registry.register(firstHook);
    registry.register(secondHook);
    unregisterFirst();
    unregisterFirst();
    await registry.run(0);

    expect(firstHook).not.toHaveBeenCalled();
    expect(secondHook).toHaveBeenCalledExactlyOnceWith(0);
  });

  // A loop walking the list, when a hook unregisters itself, must still reach the hook after it
  test("keeps a loop walking the hooks on the one after an unregister made mid-walk", () => {
    expect.hasAssertions();

    vi.stubGlobal("window", {});
    const registry = createHookRegistry<() => void>();
    let unregisterFirst = noop;
    const firstHook = vi.fn<() => void>(() => unregisterFirst());
    const secondHook = vi.fn<() => void>();
    unregisterFirst = registry.register(firstHook);
    registry.register(secondHook);
    for (const hook of registry.hooks) hook();

    expect(secondHook).toHaveBeenCalledExactlyOnceWith();
  });
});
