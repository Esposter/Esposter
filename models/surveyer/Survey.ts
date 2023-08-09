import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { z } from "zod";

export class Survey extends AItemEntity {
  group: string | null = null;
  model = "";

  constructor(init?: Partial<Survey>) {
    super();
    Object.assign(this, init);
  }
}

export const surveySchema = aItemEntitySchema.merge(
  z.object({
    group: z.string().nullable(),
    model: z.string(),
  }),
) satisfies z.ZodType<Survey>;
