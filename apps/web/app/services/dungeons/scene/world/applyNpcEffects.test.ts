/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full
   store type; A partial fake: the typed store has members this test never reads; Phaser cannot initialise under the
   test environment, and no test reads its values; vue-phaserjs loads Phaser, and only the fade effect sleeps the
   scene */
import type { Effect } from "#src/models/dungeons/npc/effect/Effect";
import type { SceneWithPlugins } from "vue-phaserjs";

import { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { EffectType } from "#src/models/dungeons/npc/effect/EffectType";
import { Npc } from "#src/models/dungeons/scene/world/Npc";
import { applyNpcEffects } from "#src/services/dungeons/scene/world/applyNpcEffects";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { showMessages } = vi.hoisted(() => ({
  showMessages: vi.fn<(scene: SceneWithPlugins, messages: { text: string }[]) => Promise<void>>(),
}));

// The dungeons store imports Phaser, which cannot initialise under the test environment, so the fake replaces it.
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// The dialog is UI over the scene, so only the messages it is asked to show are recorded
vi.mock("#src/store/dungeons/world/dialog", () => ({ useWorldDialogStore: () => ({ showMessages }) }));

// The scene's camera and timing are Phaser's, and only the fade effect reaches them, which these tests do not run
vi.mock("phaser", () => ({ Cameras: { Scene2D: { Events: {} } } }));
vi.mock("vue-phaserjs", () => ({ sleepScene: () => Promise.resolve() }));

const getNpc = (effects: Effect[]) => new Npc({ effects, name: NpcId.John });

describe(applyNpcEffects, () => {
  const scene = createSceneWithPlugins();

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value.player.monsters = [new Monster(MonsterKey.Iguanignite)];
    showMessages.mockReset();
    showMessages.mockResolvedValue(undefined);
  });

  test("an NPC's effects run one after another, each once the one before has finished", async () => {
    expect.hasAssertions();

    const shownTexts: string[] = [];
    const isSecondMessageShown = Promise.withResolvers<void>();
    showMessages.mockImplementation((_scene, messages) => {
      shownTexts.push(messages[0]?.text ?? "");
      if (messages[0]?.text === "second") isSecondMessageShown.resolve();
      return Promise.resolve();
    });
    const firstEffect = { messages: ["first"], type: EffectType.Message };
    const secondEffect = { messages: ["second"], type: EffectType.Message };
    await applyNpcEffects(scene, getNpc([firstEffect, secondEffect]));
    await isSecondMessageShown.promise;

    expect(shownTexts).toStrictEqual(["first", "second"]);
  });

  test("a heal effect restores every monster in the party to full health", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    const party = [new Monster(MonsterKey.Iguanignite), new Monster(MonsterKey.Iguanignite)];
    for (const monster of party) monster.status.health = 1;
    save.value.player.monsters = party;
    await applyNpcEffects(scene, getNpc([{ type: EffectType.Heal }]));

    expect(save.value.player.monsters.map(({ status }) => status.health)).toStrictEqual(
      party.map(({ statistics }) => statistics.maxHealth),
    );
  });
});
