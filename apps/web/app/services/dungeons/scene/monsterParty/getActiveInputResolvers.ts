import type { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";

import { MenuInputResolver } from "#src/models/resolvers/dungeons/menu/MenuInputResolver";
import { MoveInputResolver } from "#src/models/resolvers/dungeons/monsterParty/MoveInputResolver";
import { SceneInputResolver } from "#src/models/resolvers/dungeons/monsterParty/SceneInputResolver";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";
import { useMonsterPartyMenuStore } from "#src/store/dungeons/monsterParty/menu";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new MenuInputResolver(useConfirmationMenuStore),
  new MoveInputResolver(),
  new MenuInputResolver(useMonsterPartyMenuStore),
  new SceneInputResolver(),
];
