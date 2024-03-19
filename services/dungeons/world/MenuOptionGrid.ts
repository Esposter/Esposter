import { Grid } from "@/models/dungeons/Grid";
import { MenuOption } from "@/models/dungeons/world/MenuOption";

const grid = [[MenuOption.Save], [MenuOption.Exit]] as const;
export const MenuOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>(grid);
