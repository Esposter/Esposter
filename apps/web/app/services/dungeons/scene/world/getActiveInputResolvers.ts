import type { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";

import { MenuInputResolver } from "#src/models/resolvers/dungeons/menu/MenuInputResolver";
import { MessageInputResolver } from "#src/models/resolvers/dungeons/world/MessageInputResolver";
import { MovementInteractionInputResolver } from "#src/models/resolvers/dungeons/world/MovementInteractionInputResolver";
import { useWorldMenuStore } from "#src/store/dungeons/world/menu";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new MessageInputResolver(),
  new MenuInputResolver(useWorldMenuStore),
  new MovementInteractionInputResolver(),
];
