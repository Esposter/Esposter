import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { SceneWithPlugins } from "vue-phaserjs";

import { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import { Npc } from "@/models/dungeons/scene/world/Npc";
import { applyNpcEffects } from "@/services/dungeons/scene/world/applyNpcEffects";
import { useDungeonsStore } from "@/store/dungeons";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { showMessages } = vi.hoisted(() => ({
  showMessages: vi.fn<(scene: SceneWithPlugins, messages: { text: string }[]) => Promise<void>>(),
}));

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its save is read here, so
// The fake keeps the real save shape and holds one save for every reader
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { Save } = await import("#shared/models/dungeons/data/Save");
  const { reactive } = await import("vue");
  const dungeonsStore = reactive({ dungeons: new Dungeons(), save: new Save() });
  return { useDungeonsStore: () => dungeonsStore };
});

// The dialog is UI over the scene, so only the messages it is asked to show are recorded
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed store has members this test never reads
vi.mock("@/store/dungeons/world/dialog", () => ({ useWorldDialogStore: () => ({ showMessages }) }));

// The scene's camera and timing are Phaser's, and only the fade effect reaches them, which these tests do not run
// oxlint-disable-next-line vitest/prefer-import-in-mock -- Phaser cannot initialise under the test environment, and no test reads its values
vi.mock("phaser", () => ({ Cameras: { Scene2D: { Events: {} } } }));
// oxlint-disable-next-line vitest/prefer-import-in-mock -- vue-phaserjs loads Phaser, and only the fade effect sleeps the scene
vi.mock("vue-phaserjs", () => ({ sleepScene: () => Promise.resolve() }));

describe(applyNpcEffects, () => {
  const scene = {} as SceneWithPlugins;

  const getNpc = (effects: Effect[]) => new Npc({ effects, name: NpcId.John });

  beforeEach(() => {
    setActivePinia(createPinia());
    useDungeonsStore().save.player.monsters = [new Monster(MonsterKey.Iguanignite)];
    showMessages.mockReset();
    showMessages.mockImplementation(() => Promise.resolve());
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
    const party = [new Monster(MonsterKey.Iguanignite), new Monster(MonsterKey.Iguanignite)];
    for (const monster of party) monster.status.health = 1;
    dungeonsStore.save.player.monsters = party;
    await applyNpcEffects(scene, getNpc([{ type: EffectType.Heal }]));

    expect(dungeonsStore.save.player.monsters.map(({ status }) => status.health)).toStrictEqual(
      party.map(({ statistics }) => statistics.maxHealth),
    );
  });
});
