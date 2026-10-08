import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// One of the world's people, placed in its region's data as the game places an NPC: its id the game's own, its name
// By text id, the spot it idles at and the way it faces there in radians, the catalogue area it belongs to, and the
// Talk F begins with it
export interface Resident {
  areaId: string;
  id: string;
  nameTextId: string;
  position: GroundPoint;
  rotation: number;
  talkId: string;
}

export const residentSchema = z.object({
  areaId: z.string().min(1),
  id: z.string().min(1),
  nameTextId: z.string().min(1),
  position: groundPointSchema,
  rotation: z.number(),
  talkId: z.string().min(1),
}) satisfies z.ZodType<Resident>;
