// @vitest-environment nuxt
import type { MockInstance } from "vitest";

import { Save } from "#shared/models/dungeons/data/Save";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { transitionFrom } from "#src/services/dungeons/scene/transitionFrom";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartyInputStore } from "#src/store/dungeons/monsterParty/input";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
/* oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its
   full store type */
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// The scene switch belongs to Phaser, so only its calls are recorded
vi.mock(import("#src/services/dungeons/scene/transitionFrom"), async () => {
  const { SceneKey: MockSceneKey } = await import("#src/models/dungeons/keys/SceneKey");
  const { computed } = await import("vue");
  const transitionFromMock = {
    launchScene: vi.fn<() => void>(),
    previousSceneKey: computed(() => MockSceneKey.Battle),
    removeScenesAbove: vi.fn<() => void>(),
    switchToPreviousScene: vi.fn<() => void>(),
  };
  return { transitionFrom: () => transitionFromMock };
});

// Text animation drives Phaser's scene, and the dialog store only reaches it once a message is shown, which these tests
// Never do
vi.mock(import("#src/services/dungeons/text/animateText"), () => ({ animateText: () => Promise.resolve() }));

const setParty = (...monsters: Monster[]) => {
  const dungeonsStore = useDungeonsStore();
  const { save } = storeToRefs(dungeonsStore);
  save.value.player.monsters = monsters;
};

// The party is read through reactive proxies, so a monster is found by its place in the party rather than by identity
const selectPartyMonster = (partyIndex: number) => {
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const { monsterPartyOptionGrid } = monsterPartySceneStore;
  monsterPartyOptionGrid.position.value = { x: partyIndex, y: 0 };
};

const getFaintedMonster = () => {
  const monster = new Monster(MonsterKey.Iguanignite);
  monster.status.health = 0;
  return monster;
};

describe(useMonsterPartyInputStore, () => {
  const scene = createSceneWithPlugins();
  let emitSpy: MockInstance<typeof phaserEventEmitter.emit>;

  // A fresh pinia per test, so the battle's active monster is read from the party as this test sets it
  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
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
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);

    expect(infoDialogMessage.value.text).toBe("Selected monster is fainted.");
    expect(transitionFrom(SceneKey.MonsterParty).switchToPreviousScene).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  test("a battle switch to the monster already fighting is refused with the reason shown", async () => {
    expect.hasAssertions();

    setParty(new Monster(MonsterKey.Iguanignite), getFaintedMonster());
    selectPartyMonster(0);
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, PlayerSpecialInput.Confirm);
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);

    expect(infoDialogMessage.value.text).toBe("Selected monster is already battling.");
    expect(emitSpy).not.toHaveBeenCalled();
  });

  test("a battle switch to a standing monster returns to the battle and switches to it", async () => {
    expect.hasAssertions();

    const bench = new Monster(MonsterKey.Iguanignite);
    setParty(new Monster(MonsterKey.Iguanignite), bench);
    selectPartyMonster(1);
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(transitionFrom(SceneKey.MonsterParty).switchToPreviousScene).toHaveBeenCalledWith(scene);
    expect(emitSpy).toHaveBeenCalledWith("switchMonster", bench);
  });

  test("cancelling a battle switch is refused while the fighting monster is fainted", async () => {
    expect.hasAssertions();

    // The battle picks its fighting monster when the party screen opens, so the monster only faints after that
    const fighting = new Monster(MonsterKey.Iguanignite);
    setParty(fighting, new Monster(MonsterKey.Iguanignite));
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    fighting.status.health = 0;
    await onPlayerInput(scene, PlayerSpecialInput.Cancel);

    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);

    expect(infoDialogMessage.value.text).toBe("You need to select a monster to switch to.");
    expect(transitionFrom(SceneKey.MonsterParty).switchToPreviousScene).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalledWith("unswitchMonster");
  });
});
