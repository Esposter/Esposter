import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { z } from "zod";

// One hitbox of an ability in a gcsim character config: its name, shape and centre, the offset from that centre as
// Sideways and forward metres, and a circle's radius and fan angle in degrees or a box's width and length. The line is
// Where its name stands in the config
export interface GcsimHitbox {
  box?: [number, number];
  center: GcsimHitboxCenter;
  fanAngle?: number;
  line: number;
  name: string;
  offset?: [number, number];
  radius?: number;
  shape: GcsimHitboxShape;
}

export const gcsimHitboxSchema: z.ZodType<GcsimHitbox> = z.object({
  box: z.tuple([z.number().nonnegative(), z.number().nonnegative()]).optional(),
  center: z.enum(GcsimHitboxCenter),
  fanAngle: z.number().positive().optional(),
  line: z.int().positive(),
  name: z.string().min(1),
  offset: z.tuple([z.number(), z.number()]).optional(),
  radius: z.number().nonnegative().optional(),
  shape: z.enum(GcsimHitboxShape),
});
