import type { ProfileStory } from "#src/models/profile/ProfileStory";

import { profileStorySchema } from "#src/models/profile/ProfileStory";
import { z } from "zod";

// A playable character's Profile tab in one language: its stories and then its voice-overs, each in the order the game lists
// Them, and the name of its Namecard, empty for the few characters the game gives none
export interface ProfileText {
  namecardIconName: string;
  stories: ProfileStory[];
  voices: ProfileStory[];
}

export const profileTextSchema = z.object({
  namecardIconName: z.string(),
  stories: profileStorySchema.array(),
  voices: profileStorySchema.array(),
}) satisfies z.ZodType<ProfileText>;
