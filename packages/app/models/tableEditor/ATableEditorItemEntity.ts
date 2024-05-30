import { AItemEntity, aItemEntitySchema } from "@/models/shared/entity/AItemEntity";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { z } from "zod";

export abstract class ATableEditorItemEntity extends AItemEntity {
  name = DEFAULT_NAME;
}

export const aTableEditorItemEntitySchema = z
  .object({
    name: z.string().min(1),
  })
  .merge(aItemEntitySchema) satisfies z.ZodType<ATableEditorItemEntity>;
