import { z } from "zod";

// A story or voice-over on a character's Profile tab in one language: its title and its text, and the Friendship Level it
// Opens at, 0 when no level does. A condition other than a level keeps it locked whatever the level
export interface ProfileStory {
  friendshipLevel: number;
  hasOtherCondition: boolean;
  text: string;
  title: string;
}

export const profileStorySchema = z.object({
  friendshipLevel: z.int().nonnegative(),
  hasOtherCondition: z.boolean(),
  text: z.string(),
  title: z.string(),
}) satisfies z.ZodType<ProfileStory>;
