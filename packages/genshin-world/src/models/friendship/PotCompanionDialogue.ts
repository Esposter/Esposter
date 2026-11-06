import type { Talk } from "#src/models/dialogue/Talk";
import type { FriendshipDialogue } from "#src/models/friendship/FriendshipDialogue";

import { talkSchema } from "#src/models/dialogue/Talk";
import { z } from "zod";

// A Serenitea Pot companion's talk as its Friendship Level opens it: the character it belongs to, the level and quest it
// Opens under, and the talk the companion speaks, with its lines
export interface PotCompanionDialogue extends FriendshipDialogue {
  characterId: number;
  talk: Talk;
}

export const potCompanionDialogueSchema = z.object({
  characterId: z.int().positive(),
  friendshipLevel: z.int().positive(),
  questId: z.string(),
  talk: talkSchema,
}) satisfies z.ZodType<PotCompanionDialogue>;
