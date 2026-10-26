import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import {
  MAX_BLOSSOM_CLAIM_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_SAVE_INSTANT_LENGTH,
  MAX_TROUNCE_BLOSSOM_COUNT,
} from "#src/services/save/constants";
import { z } from "zod";

// A Trounce Blossom as the save holds it: where its boss fell and the newest claims it kept, oldest first
const trounceBlossomBaseSchema = z.object({
  claimedAts: z.array(z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH)).max(MAX_BLOSSOM_CLAIM_COUNT),
  place: groundPointSchema,
});

export const trounceBlossomSaveSchema = z.discriminatedUnion("kind", [
  trounceBlossomBaseSchema.extend({ kind: z.literal(BlossomKind.NormalBoss), uniqueDropId: z.int() }),
  trounceBlossomBaseSchema.extend({ kind: z.literal(BlossomKind.WeeklyBoss) }),
]);

// The blossoms the defeated bosses left, each by the spawn key its boss fell under
export const trounceBlossomsSaveSchema = z
  .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), trounceBlossomSaveSchema)
  .refine((trounceBlossomMap) => Object.keys(trounceBlossomMap).length <= MAX_TROUNCE_BLOSSOM_COUNT, {
    error: "Too many Trounce Blossoms",
  });

export type TrounceBlossomSave = z.infer<typeof trounceBlossomSaveSchema>;
