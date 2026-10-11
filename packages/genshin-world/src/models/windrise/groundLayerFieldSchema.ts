import type { GroundLayerField } from "genshin-engine";

import { GroundLayer } from "genshin-engine";
import { z } from "zod";

// Where a ground's layers lie, as the Windrise fit writes its field: the side of a cell in metres, the corner of its
// Grid, its node counts along x and z, and each layer's share at every node, from none to all
export const groundLayerFieldSchema = z.object({
  cellSize: z.number().positive(),
  layers: z.partialRecord(z.enum(GroundLayer), z.array(z.number().min(0).max(1))),
  origin: z.array(z.number()).length(2),
  size: z.array(z.int().positive()).length(2),
}) satisfies z.ZodType<GroundLayerField>;
