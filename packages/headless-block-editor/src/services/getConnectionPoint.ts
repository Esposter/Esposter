import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

import { getEdgeMidpoints } from "#src/services/getEdgeMidpoints";
import { takeOne } from "@esposter/shared";

// The point a connection point index names on a shape's bounds, the index being one the binding check has accepted
export const getConnectionPoint = (bounds: Bounds, connectionPointIndex: number): Point =>
  takeOne(getEdgeMidpoints(bounds), connectionPointIndex);
