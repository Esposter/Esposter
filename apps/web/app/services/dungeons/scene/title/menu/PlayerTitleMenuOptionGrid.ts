import { Grid } from "#src/models/dungeons/Grid";
import { PlayerTitleMenuOption } from "#src/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { useDungeonsStore } from "#src/store/dungeons/index";

const grid = [
  [PlayerTitleMenuOption["New Game"]],
  [PlayerTitleMenuOption.Continue],
  [PlayerTitleMenuOption.Settings],
] as const;
export const PlayerTitleMenuOptionGrid = new Grid<typeof grid>({
  grid,
  isWrapping: true,
  validate(position) {
    const dungeonsStore = useDungeonsStore();
    const value = this.getValue(position);
    return computed(() => value !== PlayerTitleMenuOption.Continue || Boolean(dungeonsStore.dungeons.save));
  },
});
