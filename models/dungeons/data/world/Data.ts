import type { Chest } from "@/models/dungeons/data/world/Chest";
import { chestSchema } from "@/models/dungeons/data/world/Chest";
import { z } from "zod";

export class Data {
  chestMap = new Map<string, Chest>();
}

export const dataSchema = z.object({
  chestMap: z.map(z.string().min(1), chestSchema),
}) satisfies z.ZodType<Data>;
