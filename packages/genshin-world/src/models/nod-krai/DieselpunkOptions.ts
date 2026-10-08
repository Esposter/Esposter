import type { PipeRun } from "#src/models/nod-krai/PipeRun";
import type { Smokestack } from "#src/models/nod-krai/Smokestack";

import { pipeRunSchema } from "#src/models/nod-krai/PipeRun";
import { smokestackSchema } from "#src/models/nod-krai/Smokestack";
import { z } from "zod";

// A dieselpunk structure's massing: its boxes, as createBoxesGeometry takes them, the pipework running over it and the
// Smokestacks standing on it
export interface DieselpunkOptions {
  boxes: readonly (readonly number[])[];
  pipeRadius: number;
  pipeRuns: PipeRun[];
  smokestacks: Smokestack[];
}

export const dieselpunkOptionsSchema = z.object({
  boxes: z.array(z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()])),
  pipeRadius: z.number().positive(),
  pipeRuns: z.array(pipeRunSchema),
  smokestacks: z.array(smokestackSchema),
}) satisfies z.ZodType<DieselpunkOptions>;
