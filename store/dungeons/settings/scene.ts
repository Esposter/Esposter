import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { InfoContainerTextMap } from "@/services/dungeons/settings/InfoContainerTextMap";
import { SettingsOptionGrid } from "@/services/dungeons/settings/SettingsOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene } = gameStore;
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const volumeStore = useVolumeStore();
  const { updateVolume, isUpdateVolume } = volumeStore;
  const colorPickerStore = useColorPickerStore();
  const { updateMenuColor, isUpdateMenuColor } = colorPickerStore;
  const optionGrid = ref(SettingsOptionGrid);
  const selectedSettingsOption = computed(
    () => optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y }) as SettingsOption,
  );
  // We need to do 1 of 2 things when the option grid is updated:
  // 1. If the user has selected the settings option column or moved up or down regardless of keyboard/click/touch
  // i.e. (newX === 0 || newY !== oldY), then we should automatically switch it to the active settings value
  // 2. Otherwise automatically sync settings value with option grid value
  // We unforunately need to watch the properties separately instead of
  // watching the entire position object with deep: true, since oldValue
  // won't update at all unless you replace the entire object everytime
  // you do an update which is way too annoying and not clean code at all :C
  watch([() => optionGrid.value.position.y, () => optionGrid.value.position.x], ([newY, newX], [oldY]) => {
    if (!(selectedSettingsOption.value in settings.value)) return;

    if (newX === 0 || newY !== oldY) {
      const value = settings.value[selectedSettingsOption.value as keyof typeof settings.value];
      const x = optionGrid.value.getPositionX(value as typeof optionGrid.value.value, newY);
      if (x === null) return;

      optionGrid.value.position.x = x;
      return;
    }

    setSettings(selectedSettingsOption.value as keyof typeof settings.value, optionGrid.value.value);
  });

  const infoText = computed(() => InfoContainerTextMap[selectedSettingsOption.value]);

  const onPlayerInput = (justDownInput: PlayerInput, input: PlayerInput, delta: number) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
    // Handle special cases first with player direction input
    else if (isUpdateVolume(input, selectedSettingsOption.value)) updateVolume(input, delta);
    else if (isUpdateMenuColor(justDownInput, selectedSettingsOption.value)) updateMenuColor(justDownInput);
    else optionGrid.value.move(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm: {
        const selectedSettingsOption = optionGrid.value.getValue({ x: 0, y: optionGrid.value.position.y });
        if (selectedSettingsOption === SettingsOption.Close) fadeSwitchToScene(SceneKey.Title);
        return;
      }
      case PlayerSpecialInput.Cancel:
        fadeSwitchToScene(SceneKey.Title);
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  return { optionGrid, infoText, onPlayerInput };
});
