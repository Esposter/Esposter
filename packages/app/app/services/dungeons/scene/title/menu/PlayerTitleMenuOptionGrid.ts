import { Grid } from "@/models/dungeons/Grid";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const grid = [
  [PlayerTitleMenuOption["New Game"]],
  [PlayerTitleMenuOption.Continue],
  [PlayerTitleMenuOption.Settings],
] as const;
export const PlayerTitleMenuOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>({
  grid,
  validate(position) {
    const titleSceneStore = useTitleSceneStore();
    const { isContinueEnabled } = storeToRefs(titleSceneStore);
    const value = this.getValue(position);
    return computed(() => (value === PlayerTitleMenuOption.Continue ? isContinueEnabled.value : true));
  },
  wrap: true,
});
