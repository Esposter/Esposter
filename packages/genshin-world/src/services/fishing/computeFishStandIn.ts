import type { FishGeometryOptions } from "genshin-engine";

import { FISH_STAND_IN_SHAPES } from "#src/services/fishing/constants";
import { takeOne } from "@esposter/shared";

// A fish's stand-in body: the table's bodies in turn by its category's id, and the first, the standard body, for a fish
// That files in no category. The table gives no grouping of fish by category, so this is a variety of bodies, not a species
export const computeFishStandIn = (fishCateId: number | undefined): FishGeometryOptions =>
  takeOne(FISH_STAND_IN_SHAPES, fishCateId === undefined ? 0 : fishCateId % FISH_STAND_IN_SHAPES.length);
