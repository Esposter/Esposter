import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { Grid } from "@/models/dungeons/Grid";
import type { InteractableDirection } from "@/models/dungeons/InteractableDirection";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { dayjs } from "@/services/dayjs";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const isContinueEnabled = ref(false);
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

  const onPlayerInput = () => {
    const input = controls.value.getInput(true);
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (optionGrid.value.value) {
        case PlayerTitleMenuOption["New Game"]:
        case PlayerTitleMenuOption.Continue:
        case PlayerTitleMenuOption.Settings:
          fadeOut(dayjs.duration(0.5, "seconds").asMilliseconds());
          return;
        default:
          exhaustiveGuard(optionGrid.value.value);
      }
  };

  const onPlayerDirectionInput = (direction: InteractableDirection) => {
    optionGrid.value.move(direction);
  };

  return { isContinueEnabled, optionGrid, onPlayerInput };
});
