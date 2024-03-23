import { Grid } from "@/models/dungeons/Grid";
import { Save } from "@/models/dungeons/data/Save";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const gameStore = useGameStore();
  const { fadeSwitchToScene } = gameStore;
  const { game, save } = storeToRefs(gameStore);
  const isContinueEnabled = computed(() => game.value.saves.length > 0);
  const optionGrid = ref() as Ref<Grid<PlayerTitleMenuOption, [PlayerTitleMenuOption][]>>;

  watch(
    isContinueEnabled,
    (newIsContinueEnabled) => {
      optionGrid.value = newIsContinueEnabled
        ? new Grid([
            [PlayerTitleMenuOption["New Game"]],
            [PlayerTitleMenuOption.Continue],
            [PlayerTitleMenuOption.Settings],
          ])
        : new Grid([[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Settings]]);
    },
    { immediate: true },
  );

  const onPlayerInput = (justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (optionGrid.value.value) {
        case PlayerTitleMenuOption["New Game"]:
          save.value = new Save();
          fadeSwitchToScene(SceneKey.World);
          return;
        case PlayerTitleMenuOption.Continue:
          save.value = game.value.saves[0];
          fadeSwitchToScene(SceneKey.World);
          return;
        case PlayerTitleMenuOption.Settings:
          fadeSwitchToScene(SceneKey.Settings);
          return;
        default:
          exhaustiveGuard(optionGrid.value.value);
      }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return { isContinueEnabled, optionGrid, onPlayerInput };
});
