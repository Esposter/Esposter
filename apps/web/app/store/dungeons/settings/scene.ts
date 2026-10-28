import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Position } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/scene/settings/InfoContainerTextMap";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { checkIsUpdateThemeModeSetting } from "@/services/dungeons/settings/checkIsUpdateThemeModeSetting";
import { checkIsPlayerSpecialInput } from "@/services/dungeons/UI/input/checkIsPlayerSpecialInput";
import { getDirectionStep } from "@/services/dungeons/UI/input/getDirectionStep";
import { useDungeonsStore } from "@/store/dungeons";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { exhaustiveGuard, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { clamp } from "@vueuse/core";
import { Direction } from "grid-engine";

// A row with only its name has no value cells: Volume and Theme Mode have their own controls, Close has no value
const checkHasValueCells = (rowIndex: number) => SettingsOptionGrid.getColumnSize(rowIndex) > 1;
const SETTINGS_OPTION_SET = new Set<unknown>(Object.values(SettingsOption));
const checkIsSettingsOption = (value: unknown): value is SettingsOption => SETTINGS_OPTION_SET.has(value);
// Column 0 holds each row's option name, so its value is an option; the grid's cell type is wider than that
const getSettingsOption = (rowIndex: number): SettingsOption => {
  const value = SettingsOptionGrid.getValue({ x: 0, y: rowIndex });
  if (checkIsSettingsOption(value)) return value;

  throw new InvalidOperationError(Operation.Read, getSettingsOption.name, `row index: ${rowIndex}`);
};

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const { fadeSwitchToScene } = dungeonsStore;
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const volumeStore = useVolumeStore();
  const { checkIsUpdateVolume, updateVolume } = volumeStore;
  const colorPickerStore = useColorPickerStore();
  const { updateThemeModeSetting } = colorPickerStore;
  const selectedSettingsOption = computed(() => getSettingsOption(SettingsOptionGrid.position.value.y));
  const infoText = computed(() => InfoContainerTextMap[selectedSettingsOption.value]);
  // A row with value cells rests on the cell holding its current setting, so the cursor's column always shows the value.
  // A row without them rests on its name
  const getRestingPosition = (rowIndex: number): Position => {
    if (!checkHasValueCells(rowIndex)) return { x: 0, y: rowIndex };

    const option = getSettingsOption(rowIndex);
    const restingX = SettingsOptionGrid.getPositionX(
      // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the option is a runtime name, so its setting is the union of every setting's type, wider than the grid's value union that the lookup needs
      settingsStore.settings[option as keyof typeof settingsStore.settings] as typeof SettingsOptionGrid.value,
      rowIndex,
    );
    // A saved value that matches no cell rests on the first, so the cursor stays on a value cell
    return { x: restingX ?? 1, y: rowIndex };
  };
  // The one place a value is saved: only the cursor's own value cell calls it, so an option with no cells cannot write
  const saveSelectedValue = async () => {
    // Close is the one option without a value to save, so the cursor can never be on a cell that would save for it
    if (selectedSettingsOption.value === SettingsOption.Close) return;

    await setSettings(
      selectedSettingsOption.value,
      // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- setSettings is generic over the option, but the grid's value is the union of every cell's value, so no type relates the two without the assertion
      SettingsOptionGrid.value as (typeof settingsStore.settings)[keyof typeof settingsStore.settings],
    );
  };

  const moveSettingsRow = (direction: Direction) => {
    const rowIndex = SettingsOptionGrid.position.value.y + getDirectionStep(direction, Direction.UP);
    if (SettingsOptionGrid.getValue({ x: 0, y: rowIndex }) === undefined) return;

    SettingsOptionGrid.position.value = getRestingPosition(rowIndex);
  };

  const moveSettingsColumn = async (direction: Direction) => {
    const { x, y } = SettingsOptionGrid.position.value;
    if (!checkHasValueCells(y)) return;

    const nextX = clamp(x + getDirectionStep(direction, Direction.LEFT), 1, SettingsOptionGrid.getColumnSize(y) - 1);
    if (nextX === x) return;

    SettingsOptionGrid.position.value = { x: nextX, y };
    await saveSelectedValue();
  };

  const selectSettingsPosition = async (position: Position) => {
    const { x, y } = position;
    if (SettingsOptionGrid.getValue({ x, y }) === undefined) return;
    // The name column moves to its row without choosing a value
    if (x === 0) {
      SettingsOptionGrid.position.value = getRestingPosition(y);
      return;
    }

    SettingsOptionGrid.position.value = { x, y };
    await saveSelectedValue();
  };

  // The saved values may have loaded after the cursor last moved, so the scene rests the cursor on them when it opens
  const restSettingsCursor = () => {
    SettingsOptionGrid.position.value = getRestingPosition(SettingsOptionGrid.position.value.y);
  };

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput, input: PlayerInput, delta: number) =>
    getResultAsync(async () => {
      if (checkIsPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
      // Handle special cases first with player direction input
      else if (checkIsUpdateVolume(input, selectedSettingsOption.value)) await updateVolume(input, delta);
      else if (checkIsUpdateThemeModeSetting(justDownInput, selectedSettingsOption.value))
        await updateThemeModeSetting(justDownInput);
      else if (justDownInput === Direction.UP || justDownInput === Direction.DOWN) moveSettingsRow(justDownInput);
      else if (justDownInput === Direction.LEFT || justDownInput === Direction.RIGHT)
        await moveSettingsColumn(justDownInput);
    }).match(noop, console.error);

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

  return { infoText, onPlayerInput, restSettingsCursor, selectSettingsPosition };
});
