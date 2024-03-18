import { Grid } from "@/models/dungeons/Grid";
import { MenuOption } from "@/models/dungeons/world/MenuOption";

const grid = [[MenuOption.Save], [MenuOption.Exit]] as const;
export const MenuOptionGrid = new Grid<MenuOption, typeof grid>(grid);
