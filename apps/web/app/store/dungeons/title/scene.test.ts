import type { SceneWithPlugins } from "vue-phaserjs";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "#src/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useTitleSceneStore } from "#src/store/dungeons/title/scene";
import { NotFoundError } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

const getOptionPosition = (option: PlayerTitleMenuOption) => {
  const titleSceneStore = useTitleSceneStore();
  const { playerTitleMenuOptionGrid } = titleSceneStore;
  const position = playerTitleMenuOptionGrid.getPosition(option);
  if (!position) throw new NotFoundError(getOptionPosition.name, option);

  return position;
};

const selectOption = (option: PlayerTitleMenuOption) => {
  const titleSceneStore = useTitleSceneStore();
  const { playerTitleMenuOptionGrid } = titleSceneStore;
  playerTitleMenuOptionGrid.position.value = getOptionPosition(option);
};

describe(useTitleSceneStore, () => {
  // The scene is only handed on to the switch, which these tests replace
  const scene = {} as SceneWithPlugins;

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { dungeons, save } = storeToRefs(dungeonsStore);
    const { fadeSwitchToScene } = dungeonsStore;
    dungeons.value.save = undefined;
    save.value = new Save();
    vi.mocked(fadeSwitchToScene).mockClear();
  });

  test("continuing loads the stored save and fades into the world with it", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { dungeons, save } = storeToRefs(dungeonsStore);
    const { fadeSwitchToScene } = dungeonsStore;
    const storedSave = new Save();
    storedSave.tilemapKey = TilemapKey.HomeBuilding1;
    dungeons.value.save = storedSave;
    selectOption(PlayerTitleMenuOption.Continue);
    const titleSceneStore = useTitleSceneStore();
    const { onPlayerInput } = titleSceneStore;
    onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(save.value).toStrictEqual(storedSave);
    expect(fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.World);
  });

  test("continuing without a stored save leaves the current save and the scene alone", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    const { fadeSwitchToScene } = dungeonsStore;
    const saveBeforeOption = save.value;
    selectOption(PlayerTitleMenuOption.Continue);
    const titleSceneStore = useTitleSceneStore();
    const { onPlayerInput } = titleSceneStore;
    onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(save.value).toBe(saveBeforeOption);
    expect(fadeSwitchToScene).not.toHaveBeenCalled();
  });

  test("a new game starts a fresh save and keeps the stored one for later", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { dungeons, save } = storeToRefs(dungeonsStore);
    const { fadeSwitchToScene } = dungeonsStore;
    const storedSave = new Save();
    storedSave.tilemapKey = TilemapKey.HomeBuilding2;
    dungeons.value.save = storedSave;
    selectOption(PlayerTitleMenuOption["New Game"]);
    const titleSceneStore = useTitleSceneStore();
    const { onPlayerInput } = titleSceneStore;
    onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(save.value.tilemapKey).toBe(TilemapKey.Home);
    expect(dungeons.value.save).toStrictEqual(storedSave);
    expect(fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.World);
  });

  test("settings opens the settings scene and leaves the save alone", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    const { fadeSwitchToScene } = dungeonsStore;
    const saveBeforeOption = save.value;
    selectOption(PlayerTitleMenuOption.Settings);
    const titleSceneStore = useTitleSceneStore();
    const { onPlayerInput } = titleSceneStore;
    onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(save.value).toBe(saveBeforeOption);
    expect(fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.Settings);
  });
});
