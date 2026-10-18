import { z } from "zod";

// One seed a garden field grows, by its item id: the field it is planted in, and the seconds it takes to ripen from planting
export interface HomePlant {
  fieldItemId: number;
  seconds: number;
  seedItemId: number;
}

export const homePlantSchema = z.object({
  fieldItemId: z.int().positive(),
  seconds: z.int().positive(),
  seedItemId: z.int().positive(),
}) satisfies z.ZodType<HomePlant>;
