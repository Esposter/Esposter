// @vitest-environment nuxt
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useSceneStore } from "@/store/dungeons/scene";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSceneStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Using an item from the monster party scene unwinds every in-between scene back to the battle at once
  test("pops every key stacked above the one it unwinds to, top first", () => {
    expect.hasAssertions();

    const sceneStore = useSceneStore();
    const { popSceneKeysAbove } = sceneStore;
    const { previousSceneKeyStack } = storeToRefs(sceneStore);
    previousSceneKeyStack.value = [SceneKey.Battle, SceneKey.Inventory, SceneKey.MonsterParty, SceneKey.MonsterDetails];
    const poppedSceneKeys = popSceneKeysAbove(SceneKey.Battle);

    expect(poppedSceneKeys).toStrictEqual([SceneKey.MonsterDetails, SceneKey.MonsterParty, SceneKey.Inventory]);
    expect(previousSceneKeyStack.value).toStrictEqual([SceneKey.Battle]);
  });
});
