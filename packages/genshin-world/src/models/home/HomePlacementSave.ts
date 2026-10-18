import { homePlacementSchema } from "#src/models/home/HomePlacement";
import { MAX_HOME_PLACEMENT_COUNT } from "#src/services/home/constants";
import { z } from "zod";

// The furnishings a realm holds, each where it stands, and never more than the realms' areas hold at their furnishing
// Counts
export const homePlacementSaveSchema = z.array(homePlacementSchema).max(MAX_HOME_PLACEMENT_COUNT);
