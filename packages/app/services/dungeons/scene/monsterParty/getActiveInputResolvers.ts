import type { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { MenuInputResolver } from "@/models/resolvers/dungeons/monsterParty/MenuInputResolver";
import { SceneInputResolver } from "@/models/resolvers/dungeons/monsterParty/SceneInputResolver";

export const getActiveInputResolvers = (): AInputResolver[] => [new MenuInputResolver(), new SceneInputResolver()];
