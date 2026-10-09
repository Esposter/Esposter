import { useWorldSave } from "#src/composables/useWorldSave";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { assert, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick } from "vue";

describe(useWorldSave, () => {
  const PRIMOGEMS = 160;
  const savedState = readGenshinSave(EMPTY_GENSHIN_SAVE, {}, new Map(), new Map());

  test("emits one grant for every change made in one tick", async () => {
    expect.hasAssertions();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant, events: createWorldEvents(), savedState }));
    assert.exists(worldSave);

    worldSave.setWallet({ ...worldSave.wallet.value, [Currency.Primogem]: PRIMOGEMS });
    worldSave.setInventory({ ...worldSave.inventory.value });
    worldSave.wishPityMap.value = { ...worldSave.wishPityMap.value };
    await nextTick();

    expect(emitGrant).toHaveBeenCalledExactlyOnceWith();
    scope.stop();
  });

  test("emits a grant for an achievement's progress, which carries no bag or wallet change", async () => {
    expect.hasAssertions();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant, events: createWorldEvents(), savedState }));
    assert.exists(worldSave);

    worldSave.achievementProgressMap.value = new Map();
    await nextTick();

    expect(emitGrant).toHaveBeenCalledExactlyOnceWith();
    scope.stop();
  });

  test("emits no grant before anything changes", async () => {
    expect.hasAssertions();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    scope.run(() => useWorldSave({ emitGrant, events: createWorldEvents(), savedState }));
    await nextTick();

    expect(emitGrant).not.toHaveBeenCalled();
    scope.stop();
  });
});
