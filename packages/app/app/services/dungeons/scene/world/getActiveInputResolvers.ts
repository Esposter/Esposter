import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";

import { MenuInputResolver } from "@/models/resolvers/dungeons/world/MenuInputResolver";
import { MessageInputResolver } from "@/models/resolvers/dungeons/world/MessageInputResolver";
import { MovementInteractionInputResolver } from "@/models/resolvers/dungeons/world/MovementInteractionInputResolver";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new MessageInputResolver(),
  new MenuInputResolver(),
  new MovementInteractionInputResolver(),
];
