import { Grid } from "@/models/dungeons/Grid";
import { ConfirmationMenuOption } from "@/models/dungeons/scene/monsterParty/ConfirmationMenuOption";

const grid = [[ConfirmationMenuOption.Yes], [ConfirmationMenuOption.No]] as const;
export const MonsterPartyConfirmationMenuOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>({ grid });
