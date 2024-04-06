import type { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { HealItemResolver } from "@/models/resolvers/dungeons/item/HealItemResolver";

export const getAllItemResolvers = (): AItemResolver[] => [new HealItemResolver()];
