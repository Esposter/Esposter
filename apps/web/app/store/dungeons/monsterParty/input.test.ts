// @vitest-environment nuxt
import type { MockInstance } from "vitest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { useMonsterPartyOptionGrid } from "@/composables/dungeons/scene/monsterParty/useMonsterPartyOptionGrid";
import { usePreviousScene } from "@/composables/dungeons/usePreviousScene";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";
import { useDungeonsStore } from "@/store/dungeons";
import { useMonsterPartyInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartyInputStore } from "@/store/dungeons/monsterParty/input";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its save is read here, so
// The fake keeps the real save shape and holds one save for every reader
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { Save: DungeonsSave } = await import("#shared/models/dungeons/data/Save");
  const { reactive } = await import("vue");
  const dungeonsStore = reactive({
    dungeons: new Dungeons(),
    fadeSwitchToScene: vi.fn<() => void>(),
    save: new DungeonsSave(),
    saveDungeons: vi.fn<() => void>(),
  });
  return { useDungeonsStore: () => dungeonsStore };
});

// The scene switch belongs to Phaser, so only its calls are recorded
vi.mock(import("@/composables/dungeons/usePreviousScene"), async () => {
  const { SceneKey: MockSceneKey } = await import("@/models/dungeons/keys/SceneKey");
  const { computed } = await import("vue");
  const usePreviousSceneMock = {
    launchScene: vi.fn<() => void>(),
    previousSceneKey: computed(() => MockSceneKey.Battle),
    removeScenesAbove: vi.fn<() => void>(),
    switchToPreviousScene: vi.fn<() => void>(),
  };
  return { usePreviousScene: () => usePreviousSceneMock };
});

// Text animation drives Phaser's scene, and the dialog store only reaches it once a message is shown, which these tests
// Never do
vi.mock(import("@/composables/dungeons/text/useAnimateText"), () => ({ useAnimateText: () => Promise.resolve() }));

const setParty = (...monsters: Monster[]) => {
  const dungeonsStore = useDungeonsStore();
  dungeonsStore.save.player.monsters = monsters;
};

// The party is read through reactive proxies, so a monster is found by its place in the party rather than by identity
const selectPartyMonster = (partyIndex: number) => {
  useMonsterPartyOptionGrid().position.value = { x: partyIndex, y: 0 };
};

const getFaintedMonster = () => {
  const monster = new Monster(MonsterKey.Iguanignite);
  monster.status.health = 0;
  return monster;
};

describe(useMonsterPartyInputStore, () => {
  const scene = {} as SceneWithPlugins;
  let emitSpy: MockInstance<typeof phaserEventEmitter.emit>;

  // A fresh pinia per test, so the battle's active monster is read from the party as this test sets it
  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save = new Save();
    emitSpy = vi.spyOn(phaserEventEmitter, "emit");
  });

  afterEach(() => {
    emitSpy.mockRestore();
  });

  test("a battle switch to a fainted monster is refused with the reason shown", async () => {
    expect.hasAssertions();

    setParty(new Monster(MonsterKey.Iguanignite), getFaintedMonster());
    selectPartyMonster(1);
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, PlayerSpecialInput.Confirm);
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();

    expect(monsterPartyInfoPanelStore.infoDialogMessage.text).toBe("Selected monster is fainted.");
    expect(usePreviousScene(SceneKey.MonsterParty).switchToPreviousScene).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalledWith("switchMonster", expect.anything());
  });

  test("a battle switch to the monster already fighting is refused with the reason shown", async () => {
    expect.hasAssertions();

    setParty(new Monster(MonsterKey.Iguanignite), getFaintedMonster());
    selectPartyMonster(0);
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, PlayerSpecialInput.Confirm);
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();

    expect(monsterPartyInfoPanelStore.infoDialogMessage.text).toBe("Selected monster is already battling.");
    expect(emitSpy).not.toHaveBeenCalledWith("switchMonster", expect.anything());
  });

  test("a battle switch to a standing monster returns to the battle and switches to it", async () => {
    expect.hasAssertions();

    const bench = new Monster(MonsterKey.Iguanignite);
    setParty(new Monster(MonsterKey.Iguanignite), bench);
    selectPartyMonster(1);
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(usePreviousScene(SceneKey.MonsterParty).switchToPreviousScene).toHaveBeenCalledWith(scene);
    expect(emitSpy).toHaveBeenCalledWith("switchMonster", bench);
  });

  test("cancelling a battle switch is refused while the fighting monster is fainted", async () => {
    expect.hasAssertions();

    // The battle picks its fighting monster when the party screen opens, so the monster only faints after that
    const fighting = new Monster(MonsterKey.Iguanignite);
    setParty(fighting, new Monster(MonsterKey.Iguanignite));
    const monsterPartyInputStore = useMonsterPartyInputStore();
    fighting.status.health = 0;
    await monsterPartyInputStore.onPlayerInput(scene, PlayerSpecialInput.Cancel);

    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();

    expect(monsterPartyInfoPanelStore.infoDialogMessage.text).toBe("You need to select a monster to switch to.");
    expect(usePreviousScene(SceneKey.MonsterParty).switchToPreviousScene).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalledWith("unswitchMonster");
  });
});
