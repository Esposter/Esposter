import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";

import { ConfirmationMenuInputResolver } from "@/models/resolvers/dungeons/monsterParty/ConfirmationMenuInputResolver";
import { MenuInputResolver } from "@/models/resolvers/dungeons/monsterParty/MenuInputResolver";
import { MoveInputResolver } from "@/models/resolvers/dungeons/monsterParty/MoveInputResolver";
import { SceneInputResolver } from "@/models/resolvers/dungeons/monsterParty/SceneInputResolver";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new ConfirmationMenuInputResolver(),
  new MoveInputResolver(),
  new MenuInputResolver(),
  new SceneInputResolver(),
];
