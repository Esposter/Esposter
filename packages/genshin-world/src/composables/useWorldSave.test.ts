import { useWorldSave } from "#src/composables/useWorldSave";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { useWorldAchievementsStore } from "#src/store/achievements";
import { startTestWorldSession } from "#src/store/session.fixture";
import { assert, describe, expect, test, vi } from "vitest";
import { effectScope, nextTick } from "vue";

describe(useWorldSave, () => {
  const PRIMOGEMS = 160;
  const savedState = readGenshinSave(EMPTY_GENSHIN_SAVE, {}, new Map(), new Map(), new Map());

  test("emits one grant for every change made in one tick", async () => {
    expect.hasAssertions();
    const worldSessionStore = startTestWorldSession();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant, savedState }));
    assert.exists(worldSave);

    worldSessionStore.setWallet({ ...worldSessionStore.wallet, [Currency.Primogem]: PRIMOGEMS });
    worldSessionStore.setInventory({ ...worldSessionStore.inventory });
    worldSave.wishPityMap.value = { ...worldSave.wishPityMap.value };
    await nextTick();

    expect(emitGrant).toHaveBeenCalledExactlyOnceWith();
    scope.stop();
  });

  test("emits a grant for an achievement's progress, which carries no bag or wallet change", async () => {
    expect.hasAssertions();
    startTestWorldSession();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant, savedState }));
    assert.exists(worldSave);

    useWorldAchievementsStore().achievementProgressMap = new Map();
    await nextTick();

    expect(emitGrant).toHaveBeenCalledExactlyOnceWith();
    scope.stop();
  });

  test("keeps a camp cleared again once", () => {
    expect.hasAssertions();
    const { events } = startTestWorldSession();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant: vi.fn<() => void>(), savedState }));
    assert.exists(worldSave);
    const camp = { id: "made-up-camp", position: { x: 1, z: 2 } };

    events.emit("campCleared", camp);
    events.emit("campCleared", camp);

    expect(worldSave.clearedCamps.value).toStrictEqual([camp]);
  });

  test("the cooking progress and queues load from the save", () => {
    expect.hasAssertions();
    const cookingSavedState = readGenshinSave(
      { ...EMPTY_GENSHIN_SAVE, cooking: { learnedRecipeIds: [1], processingJobs: {}, proficiencies: { 1: 2 } } },
      {},
      new Map(),
      new Map(),
      new Map(),
    );
    startTestWorldSession();
    const scope = effectScope();
    const worldSave = scope.run(() => useWorldSave({ emitGrant: vi.fn<() => void>(), savedState: cookingSavedState }));
    assert.exists(worldSave);

    expect(worldSave.cookingProgress.value).toStrictEqual({ learnedRecipeIds: [1], proficiencies: { 1: 2 } });
    scope.stop();
  });

  test("emits no grant before anything changes", async () => {
    expect.hasAssertions();
    startTestWorldSession();
    const emitGrant = vi.fn<() => void>();
    const scope = effectScope();
    scope.run(() => useWorldSave({ emitGrant, savedState }));
    await nextTick();

    expect(emitGrant).not.toHaveBeenCalled();
    scope.stop();
  });
});
