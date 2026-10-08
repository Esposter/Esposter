import type { LatheSection } from "genshin-engine";
import type { Vector3 } from "three";

import { latheSectionSchema } from "#src/models/world/latheSectionSchema";
import { vector3Schema } from "#src/models/world/vector3Schema";
import { z } from "zod";

// A smokestack standing on its foot at position, its sections stacked from the foot up
export interface Smokestack {
  position: Vector3;
  sections: LatheSection[];
}

export const smokestackSchema = z.object({
  position: vector3Schema,
  sections: z.array(latheSectionSchema),
}) satisfies z.ZodType<Smokestack>;
