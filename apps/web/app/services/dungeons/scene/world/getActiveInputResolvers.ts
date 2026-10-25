import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";

import { MenuInputResolver } from "@/models/resolvers/dungeons/menu/MenuInputResolver";
import { MessageInputResolver } from "@/models/resolvers/dungeons/world/MessageInputResolver";
import { MovementInteractionInputResolver } from "@/models/resolvers/dungeons/world/MovementInteractionInputResolver";
import { useWorldMenuStore } from "@/store/dungeons/world/menu";

export const getActiveInputResolvers = (): AInputResolver[] => [
  new MessageInputResolver(),
  new MenuInputResolver(useWorldMenuStore),
  new MovementInteractionInputResolver(),
];
