import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { AVisualTypeResolver } from "@/models/resolvers/dashboard/visual/AVisualTypeResolver";

import { ColumnResolver } from "@/models/resolvers/dashboard/visual/ColumnResolver";
import { FunnelResolver } from "@/models/resolvers/dashboard/visual/FunnelResolver";
import { RadialBarResolver } from "@/models/resolvers/dashboard/visual/RadialBarResolver";
import { ScatterResolver } from "@/models/resolvers/dashboard/visual/ScatterResolver";
import { SlopeResolver } from "@/models/resolvers/dashboard/visual/SlopeResolver";
import { TreemapResolver } from "@/models/resolvers/dashboard/visual/TreemapResolver";
import { TypeResolver } from "@/models/resolvers/dashboard/visual/TypeResolver";

export const getActiveVisualTypeResolvers = (type: VisualType): AVisualTypeResolver[] =>
  [
    new TypeResolver(),
    new ColumnResolver(),
    new FunnelResolver(),
    new RadialBarResolver(),
    new ScatterResolver(),
    new SlopeResolver(),
    new TreemapResolver(),
  ].filter((r) => r.isActive(type));
