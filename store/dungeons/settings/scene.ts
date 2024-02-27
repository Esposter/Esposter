import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import type { Direction } from "grid-engine";

export const useSettingsSceneStore = defineStore("dungeons/settings/scene", () => {
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const isContinueEnabled = ref(false);
  // @TODO: We should be able to simplify this in ts 5.4 with NoInfer
  const grid = [
    [PlayerSettingsMenuOption["Text Speed"]],
    [PlayerSettingsMenuOption["Battle Scene"]],
    [PlayerSettingsMenuOption["Battle Style"]],
    [PlayerSettingsMenuOption["Sound"]],
    [PlayerSettingsMenuOption["Volume"]],
    [PlayerSettingsMenuOption["Menu Color"]],
    [PlayerSettingsMenuOption["Close"]],
  ];
  const optionGrid = ref(new Grid<PlayerSettingsMenuOption, typeof grid>(grid, 7, 4));

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

  return { isContinueEnabled, optionGrid, onPlayerInput };
});
