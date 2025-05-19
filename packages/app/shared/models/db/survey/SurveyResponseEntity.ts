import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { selectSurveySchema } from "#shared/db/schema/surveys";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { z } from "zod";

export class SurveyResponseEntity extends AzureEntity {
  model: Record<string, unknown> = {};
  modelVersion = 0;

  constructor(init?: Partial<SurveyResponseEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const surveyResponseEntitySchema = createAzureEntitySchema(
  z.object({
    partitionKey: selectSurveySchema.shape.id,
    rowKey: z.uuid(),
  }),
).extend(
  z.object({
    model: z.record(z.string().min(1), z.unknown()),
    modelVersion: z.number().int().nonnegative(),
  }),
) satisfies z.ZodType<ToData<SurveyResponseEntity>>;
