import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { MAX_BLOSSOM_CLAIM_COUNT, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A Trounce Blossom as the save holds it: where its boss fell and the newest claims it kept, oldest first
export interface TrounceBlossomSaveBase {
  claimedAts: string[];
  place: GroundPoint;
}

export const trounceBlossomSaveBaseSchema = z.object({
  claimedAts: z.array(z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH)).max(MAX_BLOSSOM_CLAIM_COUNT),
  place: groundPointSchema,
}) satisfies z.ZodType<TrounceBlossomSaveBase>;
