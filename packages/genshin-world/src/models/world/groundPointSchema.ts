import type { GroundPoint } from "genshin-engine";

import { z } from "zod";

export const groundPointSchema = z.object({ x: z.number(), z: z.number() }) satisfies z.ZodType<GroundPoint>;
