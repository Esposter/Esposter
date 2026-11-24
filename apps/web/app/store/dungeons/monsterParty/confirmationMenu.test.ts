/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed dungeons store would load Phaser and its
   full store type, and the text animation drives Phaser's scene */

import { Save } from "#shared/models/dungeons/data/Save";
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "#src/services/dungeons/scene/monsterParty/constants";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
/* oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its
   full store type */
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// Text animation drives Phaser's scene, and the dialog store only reaches it once a message is shown, which these tests
// Never do
vi.mock(import("#src/services/dungeons/text/animateText"), () => ({ animateText: () => Promise.resolve() }));

describe(useConfirmationMenuStore, () => {
  const scene = createSceneWithPlugins();

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
  });

  test("backing out of the confirmation returns to the menu and restores the info text", () => {
    expect.hasAssertions();

    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { sceneMode } = storeToRefs(monsterPartySceneStore);
    sceneMode.value = SceneMode.Confirmation;
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);
    infoDialogMessage.value.text = "Release a monster?";
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onPlayerInput } = confirmationMenuStore;
    onPlayerInput(scene, PlayerSpecialInput.Cancel);

    expect(sceneMode.value).toBe(SceneMode.Menu);
    expect(infoDialogMessage.value.text).toBe(DEFAULT_INFO_DIALOG_MESSAGE);
  });

  test("dismissing the confirmation from outside it closes the menu and restores the info text", () => {
    expect.hasAssertions();

    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { sceneMode } = storeToRefs(monsterPartySceneStore);
    sceneMode.value = SceneMode.Confirmation;
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);
    infoDialogMessage.value.text = "Release a monster?";
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onDismiss } = confirmationMenuStore;
    onDismiss();

    expect(sceneMode.value).toBe(SceneMode.Default);
    expect(infoDialogMessage.value.text).toBe(DEFAULT_INFO_DIALOG_MESSAGE);
  });
});
