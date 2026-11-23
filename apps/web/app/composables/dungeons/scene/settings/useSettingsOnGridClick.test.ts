import type { Controls } from "#src/models/dungeons/input/Controls";

import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedSetting } from "#shared/models/dungeons/data/settings/TextSpeedSetting";
import { useSettingsOnGridClick } from "#src/composables/dungeons/scene/settings/useSettingsOnGridClick";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { useControlsStore } from "#src/store/dungeons/controls";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { getRowPosition } from "#src/store/dungeons/settings/getRowPosition.test";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// A partial fake:
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe(useSettingsOnGridClick, () => {
  const dungeonsStore = useDungeonsStore();
  const { saveDungeons } = dungeonsStore;
  let controls: Controls;

  beforeEach(() => {
    setActivePinia(createPinia());
    controls = { setInput: vi.fn<(input: PlayerSpecialInput) => void>() } as unknown as Controls;
    const controlsStore = useControlsStore();
    const { controls: storedControls } = storeToRefs(controlsStore);
    storedControls.value = controls;
    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    settings.value = getInitialSettings();
  });

  // A value cell saves on the press that lands on it, so the cell being held means the save already happened
  test("a second press on a value cell saves nothing and confirms nothing", () => {
    expect.hasAssertions();

    const settingsSceneStore = useSettingsSceneStore();
    const { settingsOptionGrid } = settingsSceneStore;
    const textSpeedRow = getRowPosition(settingsOptionGrid, SettingsOption["Text Speed"]);
    const fastCell = {
      x: settingsOptionGrid.getPositionX(TextSpeedSetting.Fast, textSpeedRow.y) ?? 0,
      y: textSpeedRow.y,
    };
    settingsOptionGrid.position.value = fastCell;
    useSettingsOnGridClick(fastCell)();

    expect(saveDungeons).not.toHaveBeenCalled();
    expect(controls.setInput).not.toHaveBeenCalled();
  });

  // An option's name is a row to select, not a value to save, so a click on it moves the cursor to that row's resting
  // Cell
  test("a click on an option's name selects its row and saves nothing", () => {
    expect.hasAssertions();

    const settingsSceneStore = useSettingsSceneStore();
    const { settingsOptionGrid } = settingsSceneStore;
    const soundRow = getRowPosition(settingsOptionGrid, SettingsOption.Sound);
    useSettingsOnGridClick(soundRow)();

    expect(settingsOptionGrid.position.value.y).toBe(soundRow.y);
    expect(saveDungeons).not.toHaveBeenCalled();
  });

  test("a second press on Close confirms and saves nothing", () => {
    expect.hasAssertions();

    const settingsSceneStore = useSettingsSceneStore();
    const { settingsOptionGrid } = settingsSceneStore;
    const closeRow = getRowPosition(settingsOptionGrid, SettingsOption.Close);
    settingsOptionGrid.position.value = closeRow;
    useSettingsOnGridClick(closeRow)();

    expect(controls.setInput).toHaveBeenCalledExactlyOnceWith(PlayerSpecialInput.Confirm);
    expect(saveDungeons).not.toHaveBeenCalled();
  });
});
