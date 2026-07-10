import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectResourceSchema } from "@/schema/resources";
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
      partitionKey: selectResourceSchema.shape.id,
      rowKey: z.uuid(),
    }),
  ).shape,
  model: z.record(z.string().min(1), z.unknown()),
  modelVersion: z.int().nonnegative(),
}) satisfies z.ZodType<ToData<SurveyResponseEntity>>;
