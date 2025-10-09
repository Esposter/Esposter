import type { CompositeKeyEntity, ToData } from "@esposter/shared";

import { selectSurveySchema } from "@esposter/db";
import { AzureEntity, createAzureEntitySchema } from "@esposter/shared";
import { z } from "zod";

export class SurveyResponseEntity extends AzureEntity {
  model: Record<string, unknown> = {};
  modelVersion = 0;

  constructor(init?: Partial<SurveyResponseEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const surveyResponseEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectSurveySchema.shape.id,
      rowKey: z.uuid(),
    }),
  ).shape,
  model: z.record(z.string().min(1), z.unknown()),
  modelVersion: z.int().nonnegative(),
}) satisfies z.ZodType<ToData<SurveyResponseEntity>>;
