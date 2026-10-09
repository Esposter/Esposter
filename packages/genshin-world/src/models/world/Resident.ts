import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { residentSpotSchema } from "#src/models/world/ResidentSpot";
import { z } from "zod";

// One of the world's people, placed in its region's data as the game places an NPC: its id the game's own, its name
// By text id, the spot it keeps in the day from six to seven and the spot it keeps the rest of the night (either one
// Absent for a resident the game shows at one time only), the catalogue area it belongs to, and the talk F begins with it
export interface Resident {
  areaId: string;
  day?: ResidentSpot;
  id: string;
  nameTextId: string;
  night?: ResidentSpot;
  talkId: string;
}

export const residentSchema = z.object({
  areaId: z.string().min(1),
  day: residentSpotSchema.optional(),
  id: z.string().min(1),
  nameTextId: z.string().min(1),
  night: residentSpotSchema.optional(),
  talkId: z.string().min(1),
}) satisfies z.ZodType<Resident>;
