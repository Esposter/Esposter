import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export abstract class AItemEntity {
  id = uuidv4();
  name = "Unnamed";
  createdAt = new Date();
  updatedAt = new Date();
}

export const aItemEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<AItemEntity>;
