import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { dayjs } from "@/services/dayjs";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/title/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useTitleSceneStore = defineStore("dungeons/title/scene", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const gameStore = useGameStore();
  const { controls } = storeToRefs(gameStore);
  const isContinueEnabled = ref(false);
  const optionGrid = ref() as Ref<Grid<PlayerTitleMenuOption>>;

  watch(
    isContinueEnabled,
    (newIsContinueEnabled) => {
      optionGrid.value = newIsContinueEnabled
        ? new Grid(
            [[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Continue], [PlayerTitleMenuOption.Options]],
            3,
            1,
          )
        : new Grid([[PlayerTitleMenuOption["New Game"]], [PlayerTitleMenuOption.Options]], 2, 1);
    },
    { immediate: true },
  );

  const cursorPositionMap = computed(() =>
    isContinueEnabled.value
      ? [
          [{ x: INITIAL_CURSOR_POSITION.x, y: 41 }],
          [{ x: INITIAL_CURSOR_POSITION.x, y: 91 }],
          [{ x: INITIAL_CURSOR_POSITION.x, y: 141 }],
        ]
      : [[{ x: INITIAL_CURSOR_POSITION.x, y: 41 }], [{ x: INITIAL_CURSOR_POSITION.x, y: 141 }]],
  );

  const onPlayerInput = () => {
    const input = controls.value.getInput();
    if (isPlayerSpecialInput(input)) onPlayerSpecialInput(input);
    else onPlayerDirectionInput(input);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    if (playerSpecialInput === PlayerSpecialInput.Confirm)
      switch (optionGrid.value.value) {
        case PlayerTitleMenuOption["New Game"]:
          scene.value.cameras.main.fadeOut(dayjs.duration(0.5, "seconds").asMilliseconds());
          return;
        case PlayerTitleMenuOption.Continue:
          return;
        case PlayerTitleMenuOption.Options:
          return;
        default:
          exhaustiveGuard(optionGrid.value.value);
      }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    optionGrid.value.move(direction);
  };

  return { isContinueEnabled, optionGrid, cursorPositionMap, onPlayerInput };
});
