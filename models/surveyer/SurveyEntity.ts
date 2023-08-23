import { AzureEntity, CompositeKeyEntity } from "@/models/azure";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { userSchema } from "@/server/trpc/routers/user";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { z } from "zod";

export class SurveyEntity extends AzureEntity {
  name = DEFAULT_NAME;
  group: string | null = null;
  model = "";
  modelVersion = 0;
  publishVersion = 0;
  publishedAt: Date | null = null;

  constructor(init: Partial<SurveyEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const surveySchema = itemMetadataSchema.merge(
  z.object({
    partitionKey: userSchema.shape.id,
    rowKey: z.string().uuid(),
    name: z.string(),
    group: z.string().nullable(),
    model: z.string(),
    modelVersion: z.number().int().nonnegative(),
    publishVersion: z.number().int().nonnegative(),
    publishedAt: z.date().nullable(),
  }),
) satisfies z.ZodType<SurveyEntity>;
