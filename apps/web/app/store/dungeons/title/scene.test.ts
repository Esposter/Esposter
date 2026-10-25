import type { SceneWithPlugins } from "vue-phaserjs";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
import { useDungeonsStore } from "@/store/dungeons";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { NotFoundError } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its saves and the scene
// Switch are read here, so the fake keeps the real save fields and records each switch
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const saveModule = await import("#shared/models/dungeons/data/Save");
  const { reactive } = await import("vue");
  const dungeonsStore = reactive({
    dungeons: new Dungeons(),
    fadeSwitchToScene: vi.fn<() => void>(),
    save: new saveModule.Save(),
  });
  return { useDungeonsStore: () => dungeonsStore };
});

const getOptionPosition = (option: PlayerTitleMenuOption) => {
  const position = PlayerTitleMenuOptionGrid.getPosition(option);
  if (!position) throw new NotFoundError(getOptionPosition.name, option);

  return position;
};

const selectOption = (option: PlayerTitleMenuOption) => {
  PlayerTitleMenuOptionGrid.position.value = getOptionPosition(option);
};

describe(useTitleSceneStore, () => {
  // The scene is only handed on to the switch, which these tests replace
  const scene = {} as SceneWithPlugins;

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    dungeonsStore.dungeons.save = undefined;
    dungeonsStore.save = new Save();
    vi.mocked(dungeonsStore.fadeSwitchToScene).mockClear();
  });

  test("continuing loads the stored save and fades into the world with it", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const storedSave = new Save();
    storedSave.tilemapKey = TilemapKey.HomeBuilding1;
    dungeonsStore.dungeons.save = storedSave;
    selectOption(PlayerTitleMenuOption.Continue);
    const titleSceneStore = useTitleSceneStore();
    titleSceneStore.onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(dungeonsStore.save).toStrictEqual(storedSave);
    expect(dungeonsStore.fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.World);
  });

  test("continuing without a stored save leaves the current save and the scene alone", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const currentSave = dungeonsStore.save;
    selectOption(PlayerTitleMenuOption.Continue);
    const titleSceneStore = useTitleSceneStore();
    titleSceneStore.onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(dungeonsStore.save).toBe(currentSave);
    expect(dungeonsStore.fadeSwitchToScene).not.toHaveBeenCalled();
  });

  test("a new game starts a fresh save and keeps the stored one for later", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const storedSave = new Save();
    storedSave.tilemapKey = TilemapKey.HomeBuilding2;
    dungeonsStore.dungeons.save = storedSave;
    selectOption(PlayerTitleMenuOption["New Game"]);
    const titleSceneStore = useTitleSceneStore();
    titleSceneStore.onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(dungeonsStore.save.tilemapKey).toBe(TilemapKey.Home);
    expect(dungeonsStore.dungeons.save).toStrictEqual(storedSave);
    expect(dungeonsStore.fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.World);
  });

  test("settings opens the settings scene and leaves the save alone", () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const currentSave = dungeonsStore.save;
    selectOption(PlayerTitleMenuOption.Settings);
    const titleSceneStore = useTitleSceneStore();
    titleSceneStore.onPlayerInput(scene, PlayerSpecialInput.Confirm);

    expect(dungeonsStore.save).toBe(currentSave);
    expect(dungeonsStore.fadeSwitchToScene).toHaveBeenCalledWith(scene, SceneKey.Settings);
  });
});
