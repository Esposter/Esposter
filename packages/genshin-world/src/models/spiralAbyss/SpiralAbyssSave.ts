import { MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { MAX_ABYSS_CYCLE_REWARD_CLAIM_COUNT } from "#src/services/spiralAbyss/constants";
import { z } from "zod";

// A chamber's progress in one cycle: whether it has been cleared, and the most stars any clear of it has held
export const spiralAbyssChamberSaveSchema = z.object({ isCleared: z.boolean(), stars: z.int().min(0).max(3) });

// One cycle of the Abyss: its chambers by id, and the rewards its clears have claimed
export const spiralAbyssCycleSaveSchema = z.object({
  chambers: z.record(z.string().max(MAX_SAVE_ID_LENGTH).regex(/^\d+$/u), spiralAbyssChamberSaveSchema),
  claimedRewardIds: z.array(z.int().positive()).max(MAX_ABYSS_CYCLE_REWARD_CLAIM_COUNT),
});

// The Abyss's progress by cycle: the Corridor's one cycle, or a Moon Spire period by its id
export const spiralAbyssSaveSchema = z.record(
  z
    .string()
    .max(MAX_SAVE_ID_LENGTH)
    .regex(/^(?:corridor|\d+)$/u),
  spiralAbyssCycleSaveSchema,
);

export type SpiralAbyssCycleSave = z.infer<typeof spiralAbyssCycleSaveSchema>;
export type SpiralAbyssSave = z.infer<typeof spiralAbyssSaveSchema>;
