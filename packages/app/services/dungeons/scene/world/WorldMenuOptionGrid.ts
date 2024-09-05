import { Grid } from "@/models/dungeons/Grid";
import { MenuOption } from "@/models/dungeons/scene/world/MenuOption";

const grid = [[MenuOption.Monsters], [MenuOption.Inventory], [MenuOption.Save], [MenuOption.Exit]] as const;
export const WorldMenuOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>({ grid, wrap: true });
