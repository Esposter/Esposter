import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { PlayerSettingsMenuOptionGrid } from "@/services/dungeons/settings/menu/PlayerSettingsMenuOptionGrid";
import { useGameStore } from "@/store/dungeons/game";
import type { Direction } from "grid-engine";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const optionGrid = ref(PlayerSettingsMenuOptionGrid);
  const infoText = ref("Test");

  const onPlayerInput = () => {
    const input = controls.value.getInput(true);
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (optionGrid.value.value) {
        default:
          return;
      }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return { optionGrid, infoText, onPlayerInput };
});
