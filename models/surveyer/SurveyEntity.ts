import { AzureEntity, CompositeKeyEntity } from "@/models/azure";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { z } from "zod";

export class SurveyEntity extends AzureEntity {
  name = DEFAULT_NAME;
  group: string | null = null;
  model = "";
  modelVersion = 0;

  constructor(init: Partial<SurveyEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const surveySchema = itemMetadataSchema.merge(
  z.object({
    // Creator id
    partitionKey: z.string().uuid(),
    // Guid
    rowKey: z.string().uuid(),
    name: z.string(),
    group: z.string().nullable(),
    model: z.string(),
    modelVersion: z.number().int().nonnegative(),
  }),
) satisfies z.ZodType<SurveyEntity>;
