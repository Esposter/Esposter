import { z } from "zod";

// A region's rocks record as the publish writes it: the boxes of each rock hull, keyed by its mesh, and every place a rock
// Of that mesh stands, in the world's own coordinates
export const rockRecordSchema = z.object({
  hulls: z.record(z.string().min(1), z.array(z.array(z.number()).length(6))),
  placements: z.array(
    z.object({
      hull: z.string().min(1),
      position: z.tuple([z.number(), z.number(), z.number()]),
      rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      scale: z.tuple([z.number(), z.number(), z.number()]),
    }),
  ),
});

export type RockRecord = z.infer<typeof rockRecordSchema>;
