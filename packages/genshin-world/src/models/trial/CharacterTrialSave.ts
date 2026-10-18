import { MAX_CHARACTER_TRIAL_STAGE_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The character trials' progress: the stages whose first clear has paid its reward, each by its stage id
export interface CharacterTrialSave {
  claimedStageIds: number[];
}
export const characterTrialSaveSchema = z.object({
  claimedStageIds: z.array(z.int().positive()).max(MAX_CHARACTER_TRIAL_STAGE_COUNT),
}) satisfies z.ZodType<CharacterTrialSave>;
