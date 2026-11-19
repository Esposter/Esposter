/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed dungeons store would load Phaser and its full store type, and the text animation drives Phaser's scene */
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "#src/services/dungeons/scene/monsterParty/constants";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its save is read here, so
// The fake keeps the real save shape and holds one save for every reader
vi.mock("#src/store/dungeons/index", async () => {
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

// Text animation drives Phaser's scene, and the dialog store only reaches it once a message is shown, which these tests
// Never do
vi.mock(import("#src/services/dungeons/text/animateText"), () => ({ animateText: () => Promise.resolve() }));

describe(useConfirmationMenuStore, () => {
  const scene = {} as SceneWithPlugins;

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save = new Save();
  });

  test("backing out of the confirmation returns to the menu and restores the info text", () => {
    expect.hasAssertions();

    const monsterPartySceneStore = useMonsterPartySceneStore();
    monsterPartySceneStore.sceneMode = SceneMode.Confirmation;
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    monsterPartyInfoPanelStore.infoDialogMessage.text = "Release a monster?";
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onPlayerInput } = confirmationMenuStore;
    onPlayerInput(scene, PlayerSpecialInput.Cancel);

    expect(monsterPartySceneStore.sceneMode).toBe(SceneMode.Menu);
    expect(monsterPartyInfoPanelStore.infoDialogMessage.text).toBe(DEFAULT_INFO_DIALOG_MESSAGE);
  });

  test("dismissing the confirmation from outside it closes the menu and restores the info text", () => {
    expect.hasAssertions();

    const monsterPartySceneStore = useMonsterPartySceneStore();
    monsterPartySceneStore.sceneMode = SceneMode.Confirmation;
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    monsterPartyInfoPanelStore.infoDialogMessage.text = "Release a monster?";
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onDismiss } = confirmationMenuStore;
    onDismiss();

    expect(monsterPartySceneStore.sceneMode).toBe(SceneMode.Default);
    expect(monsterPartyInfoPanelStore.infoDialogMessage.text).toBe(DEFAULT_INFO_DIALOG_MESSAGE);
  });
});
