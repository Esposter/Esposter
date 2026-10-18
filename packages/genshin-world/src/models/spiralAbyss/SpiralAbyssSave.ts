import { z } from "zod";

// A chamber's progress in one cycle: whether it has been cleared, and the most stars any clear of it has held
export const spiralAbyssChamberSaveSchema = z.object({ isCleared: z.boolean(), stars: z.int().min(0).max(3) });

// One cycle of the Abyss: its chambers by id, and the rewards its clears have claimed
export const spiralAbyssCycleSaveSchema = z.object({
  chambers: z.record(z.string().regex(/^\d+$/u), spiralAbyssChamberSaveSchema),
  claimedRewardIds: z.array(z.int().positive()),
});

// The Abyss's progress by cycle: the Corridor's one cycle, or a Moon Spire period by its id
export const spiralAbyssSaveSchema = z.record(z.string().regex(/^(?:corridor|\d+)$/u), spiralAbyssCycleSaveSchema);

export type SpiralAbyssCycleSave = z.infer<typeof spiralAbyssCycleSaveSchema>;
export type SpiralAbyssSave = z.infer<typeof spiralAbyssSaveSchema>;
