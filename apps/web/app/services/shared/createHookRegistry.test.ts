import { createHookRegistry } from "@/services/shared/createHookRegistry";
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
});
