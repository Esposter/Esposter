import type { Chest } from "@/models/dungeons/data/world/Chest";
import { chestSchema } from "@/models/dungeons/data/world/Chest";
import { z } from "zod";

export class Data {
  chestMap: Record<string, Chest> = {};
}

export const dataSchema = z.object({
  chestMap: z.record(chestSchema),
}) satisfies z.ZodType<Data>;
