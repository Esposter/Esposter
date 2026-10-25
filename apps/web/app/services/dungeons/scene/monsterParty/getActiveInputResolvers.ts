import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";

import { MenuInputResolver } from "@/models/resolvers/dungeons/menu/MenuInputResolver";
import { ConfirmationMenuInputResolver } from "@/models/resolvers/dungeons/monsterParty/ConfirmationMenuInputResolver";
import { MoveInputResolver } from "@/models/resolvers/dungeons/monsterParty/MoveInputResolver";
import { SceneInputResolver } from "@/models/resolvers/dungeons/monsterParty/SceneInputResolver";
import { useMonsterPartyMenuStore } from "@/store/dungeons/monsterParty/menu";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new ConfirmationMenuInputResolver(),
  new MoveInputResolver(),
  new MenuInputResolver(useMonsterPartyMenuStore),
  new SceneInputResolver(),
];
