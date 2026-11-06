import type { Region } from "#src/models/Region";

import { RegionEdge } from "#src/models/RegionEdge";
import { RegionOpening } from "#src/models/RegionOpening";
import { RegionPresentation } from "#src/models/RegionPresentation";
import { SizeClass } from "#src/models/SizeClass";
import { describe } from "vitest";

// A docked region at the start edge, sized from one to three with a default of two. A test overrides the fields it reads
export const createRegion = (overrides: Partial<Region> = {}): Region => ({
  defaultSize: 2,
  edge: RegionEdge.Start,
  id: "a",
  maximumSize: 3,
  minimumSize: 1,
  opening: RegionOpening.OnDemand,
  sizeClassEdgeMap: {},
  sizeClassPresentationMap: {
    [SizeClass.Compact]: RegionPresentation.Docked,
    [SizeClass.Expanded]: RegionPresentation.Docked,
    [SizeClass.Medium]: RegionPresentation.Docked,
  },
  ...overrides,
});

describe.todo("createRegion");
