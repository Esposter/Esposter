import { MAX_HOME_PLANTING_COUNT } from "#src/services/home/constants";
import { MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// The seeds a realm's garden holds as the save holds them: each plot, its seed and the ISO string of its planting instant.
// The list is never longer than the ceiling of plantings
export const homePlantingSaveSchema = z
  .array(
    z.object({
      plantedAt: z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
      plotId: z.int().nonnegative(),
      seedItemId: z.int().positive(),
    }),
  )
  .max(MAX_HOME_PLANTING_COUNT);

export type HomePlantingSave = z.infer<typeof homePlantingSaveSchema>;
