import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { residentSpotSchema } from "#src/models/world/ResidentSpot";
import { z } from "zod";

// One of the world's people, placed in its region's data as the game places an NPC: its id the game's own, its name
// By text id, the spot it keeps in the day from six to seven, the spot it keeps the rest of the night (its day spot when
// It has none), whether it is absent the rest of the night, the catalogue area it belongs to, the talk it begins with, and
// The game of Genius Invokation TCG it duels with when its talk offers one
export interface Resident {
  absentAtNight?: true;
  areaId: string;
  day?: ResidentSpot;
  duelGameId?: number;
  id: string;
  nameTextId: string;
  night?: ResidentSpot;
  talkId: string;
}

export const residentSchema = z.object({
  absentAtNight: z.literal(true).optional(),
  areaId: z.string().min(1),
  day: residentSpotSchema.optional(),
  duelGameId: z.int().positive().optional(),
  id: z.string().min(1),
  nameTextId: z.string().min(1),
  night: residentSpotSchema.optional(),
  talkId: z.string().min(1),
}) satisfies z.ZodType<Resident>;
