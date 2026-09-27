import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { selectResourceSchema } from "#src/schema/resources";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class SurveyResponseEntity extends AzureEntity {
  // Set while the respondent is still answering, and absent once they submit: every read of a survey's responses asks
  // For the key to be absent, which a row stored before drafts were marked also satisfies. Declared, so a submitted
  // Row carries no key rather than an own `undefined`
  declare isDraft?: true;
  model: Record<string, unknown> = {};
  modelVersion = 0;
  // Resume position, tracked apart from `model` so a question literally named "pageNo" can never collide
  // With it — 0 means the respondent never advanced past the first page
  pageNo = 0;
  // Opaque program-issued participant token, "" in Anonymous mode — resolvable only owner-side
  participantToken = "";

  constructor(init?: Partial<SurveyResponseEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const SurveyResponseEntityPropertyNames = getPropertyNames<SurveyResponseEntity>();

export const surveyResponseEntitySchema = z.object({
  ...createAzureEntitySchema(z.object({ partitionKey: selectResourceSchema.shape.id, rowKey: z.uuid() })).shape,
  isDraft: z.literal(true).optional(),
  model: z.record(z.string().min(1), z.unknown()),
  modelVersion: z.int().nonnegative(),
  pageNo: z.int().nonnegative().default(0),
  participantToken: z.union([z.literal(""), z.uuid()]).default(""),
}) satisfies z.ZodType<ToData<SurveyResponseEntity>>;
