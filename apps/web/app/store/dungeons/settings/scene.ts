import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { Position } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { Grid } from "#src/models/dungeons/Grid";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { getSettingsOption } from "#src/services/dungeons/scene/settings/getSettingsOption";
import { InfoContainerTextMap } from "#src/services/dungeons/scene/settings/InfoContainerTextMap";
import { SettingsOptionRows } from "#src/services/dungeons/scene/settings/SettingsOptionRows";
import { checkIsUpdateThemeModeSetting } from "#src/services/dungeons/settings/checkIsUpdateThemeModeSetting";
import { checkIsPlayerSpecialInput } from "#src/services/dungeons/UI/input/checkIsPlayerSpecialInput";
import { getDirectionStep } from "#src/services/dungeons/UI/input/getDirectionStep";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useColorPickerStore } from "#src/store/dungeons/settings/colorPicker";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { useVolumeStore } from "#src/store/dungeons/settings/volume";
import { exhaustiveGuard, getResult, noop } from "@esposter/shared";
import { clamp } from "@vueuse/core";
import { Direction } from "grid-engine";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const volumeStore = useVolumeStore();
  const { checkIsUpdateVolume, updateVolume } = volumeStore;
  const colorPickerStore = useColorPickerStore();
  const { updateThemeModeSetting } = colorPickerStore;
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const settingsOptionGrid = markRaw(
    new Grid({
      grid: SettingsOptionRows,
      isWrapping: false,
      position: ref({ x: 2, y: 0 }),
      // Column 0 is the option's own name, so the cursor only lands on its values
      validate: ({ x }) => x !== 0,
    }),
  );
  const selectedSettingsOption = computed(() => getSettingsOption(settingsOptionGrid.position.value.y));
  const infoText = computed(() => InfoContainerTextMap[selectedSettingsOption.value]);
  // A row with only its name has no value cells: Volume and Theme Mode have their own controls, Close has no value
  const checkHasValueCells = (rowIndex: number) => settingsOptionGrid.getColumnSize(rowIndex) > 1;
  // A row with value cells rests on the cell holding its current setting, so the cursor's column always shows the value.
  // A row without them rests on its name
  const getRestingPosition = (rowIndex: number): Position => {
    if (!checkHasValueCells(rowIndex)) return { x: 0, y: rowIndex };

    const option = getSettingsOption(rowIndex);
    const restingX = settingsOptionGrid.getPositionX(
      settingsStore.settings[option as keyof typeof settingsStore.settings] as typeof settingsOptionGrid.value,
      rowIndex,
    );
    // A saved value that matches no cell rests on the first, so the cursor stays on a value cell
    return { x: restingX ?? 1, y: rowIndex };
  };
  // The one place a value is saved: only the cursor's own value cell calls it, so an option with no cells cannot write
  const saveSelectedValue = () => {
    // Close is the one option without a value to save, so the cursor can never be on a cell that would save for it
    if (selectedSettingsOption.value === SettingsOption.Close) return;

    setSettings(
      selectedSettingsOption.value,
      settingsOptionGrid.value as (typeof settingsStore.settings)[keyof typeof settingsStore.settings],
    );
  };

  const moveSettingsRow = (direction: Direction) => {
    const rowIndex = settingsOptionGrid.position.value.y + getDirectionStep(direction, Direction.UP);
    if (settingsOptionGrid.getValue({ x: 0, y: rowIndex }) === undefined) return;

    settingsOptionGrid.position.value = getRestingPosition(rowIndex);
  };

  const moveSettingsColumn = (direction: Direction) => {
    const { x, y } = settingsOptionGrid.position.value;
    if (!checkHasValueCells(y)) return;

    const nextX = clamp(x + getDirectionStep(direction, Direction.LEFT), 1, settingsOptionGrid.getColumnSize(y) - 1);
    if (nextX === x) return;

    settingsOptionGrid.position.value = { x: nextX, y };
    saveSelectedValue();
  };

  const selectSettingsPosition = (position: Position) => {
    const { x, y } = position;
    if (settingsOptionGrid.getValue({ x, y }) === undefined) return;
    // The name column moves to its row without choosing a value
    if (x === 0) {
      settingsOptionGrid.position.value = getRestingPosition(y);
      return;
    }

    settingsOptionGrid.position.value = { x, y };
    saveSelectedValue();
  };
  // The saved values may have loaded after the cursor last moved, so the scene rests the cursor on them when it opens
  const restSettingsCursor = () => {
    settingsOptionGrid.position.value = getRestingPosition(settingsOptionGrid.position.value.y);
  };

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput, input: PlayerInput, delta: number) => {
    getResult(() => {
      if (checkIsPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
      // Handle special cases first with player direction input
      else if (checkIsUpdateVolume(input, selectedSettingsOption.value)) updateVolume(input, delta);
      else if (checkIsUpdateThemeModeSetting(justDownInput, selectedSettingsOption.value))
        updateThemeModeSetting(justDownInput);
      else if (justDownInput === Direction.UP || justDownInput === Direction.DOWN) moveSettingsRow(justDownInput);
      else if (justDownInput === Direction.LEFT || justDownInput === Direction.RIGHT) moveSettingsColumn(justDownInput);
    }).match(noop, console.error);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        fadeSwitchToScene(scene, SceneKey.Title);
        return;
      case PlayerSpecialInput.Confirm:
        if (selectedSettingsOption.value === SettingsOption.Close) fadeSwitchToScene(scene, SceneKey.Title);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  return { infoText, onPlayerInput, restSettingsCursor, selectSettingsPosition, settingsOptionGrid };
});
