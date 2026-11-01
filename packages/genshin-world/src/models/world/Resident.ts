import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { ResidentWeekGame } from "#src/models/world/ResidentWeekGame";

import { residentSpotSchema } from "#src/models/world/ResidentSpot";
import { residentWeekGameSchema } from "#src/models/world/ResidentWeekGame";
import { z } from "zod";

// One of the world's people, placed in its region's data as the game places an NPC: its id the game's own, its name
// By text id, the spot it keeps in the day from six to seven, the spot it keeps the rest of the night (its day spot when
// It has none), whether it is absent the rest of the night, the catalogue area it belongs to, the talk it begins with, and
// The game of Genius Invokation TCG it duels with when its talk offers one, the week game its weekly guest challenge offers,
// And whether it is a nation's Reputation keeper, whose talk opens the nation's Reputation screen in place of the talk
export interface Resident {
  absentAtNight?: true;
  areaId: string;
  day?: ResidentSpot;
  duelGameId?: number;
  id: string;
  keepsReputation?: true;
  nameTextId: string;
  night?: ResidentSpot;
  talkId: string;
  weekGame?: ResidentWeekGame;
}

export const residentSchema = z.object({
  absentAtNight: z.literal(true).optional(),
  areaId: z.string().min(1),
  day: residentSpotSchema.optional(),
  duelGameId: z.int().positive().optional(),
  id: z.string().min(1),
  keepsReputation: z.literal(true).optional(),
  nameTextId: z.string().min(1),
  night: residentSpotSchema.optional(),
  talkId: z.string().min(1),
  weekGame: residentWeekGameSchema.optional(),
}) satisfies z.ZodType<Resident>;
