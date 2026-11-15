import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { AVisualTypeResolver } from "#src/models/resolvers/dashboard/visual/AVisualTypeResolver";

import { ColumnResolver } from "#src/models/resolvers/dashboard/visual/ColumnResolver";
import { FunnelResolver } from "#src/models/resolvers/dashboard/visual/FunnelResolver";
import { RadialBarResolver } from "#src/models/resolvers/dashboard/visual/RadialBarResolver";
import { ScatterResolver } from "#src/models/resolvers/dashboard/visual/ScatterResolver";
import { SlopeResolver } from "#src/models/resolvers/dashboard/visual/SlopeResolver";
import { TreemapResolver } from "#src/models/resolvers/dashboard/visual/TreemapResolver";
import { TypeResolver } from "#src/models/resolvers/dashboard/visual/TypeResolver";

const VISUAL_TYPE_RESOLVERS: AVisualTypeResolver[] = [
  new TypeResolver(),
  new ColumnResolver(),
  new FunnelResolver(),
  new RadialBarResolver(),
  new ScatterResolver(),
  new SlopeResolver(),
  new TreemapResolver(),
];

export const getActiveVisualTypeResolvers = (type: VisualType) =>
  VISUAL_TYPE_RESOLVERS.filter((resolver) => resolver.checkIsActive(type));
