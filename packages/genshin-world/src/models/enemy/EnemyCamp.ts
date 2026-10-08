import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { enemyCampMemberSchema } from "#src/models/enemy/EnemyCampMember";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Enemies placed together, which wake together and, with an elite among them, come back together, in the catalogue
// Area they stand in
export interface EnemyCamp {
  areaId: string;
  id: string;
  members: EnemyCampMember[];
}

export const enemyCampSchema = z.object({
  areaId: z.string().min(1),
  id: z.string().min(1),
  members: createUniqueArraySchema(enemyCampMemberSchema, "id").min(1),
}) satisfies z.ZodType<EnemyCamp>;
