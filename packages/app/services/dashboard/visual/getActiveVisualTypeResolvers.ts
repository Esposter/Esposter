import type { VisualType } from "@/models/dashboard/VisualType";
import type { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";
import { FunnelResolver } from "@/models/resolvers/dashboard/visual/FunnelResolver";
import { ScatterResolver } from "@/models/resolvers/dashboard/visual/ScatterResolver";
import { TreemapResolver } from "@/models/resolvers/dashboard/visual/TreemapResolver";

export const getActiveVisualTypeResolvers = (type: VisualType): AVisualTypeResolver[] =>
  [new FunnelResolver(), new ScatterResolver(), new TreemapResolver()].filter((r) => r.isActive(type));
