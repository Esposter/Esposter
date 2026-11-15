import { Grid } from "#src/models/dungeons/Grid";
import { ConfirmationMenuOption } from "#src/models/dungeons/scene/monsterParty/ConfirmationMenuOption";

const grid = [[ConfirmationMenuOption.Yes], [ConfirmationMenuOption.No]] as const;
export const MonsterPartyConfirmationMenuOptionGrid = new Grid<typeof grid>({ grid });
