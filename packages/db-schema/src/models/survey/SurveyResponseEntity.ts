import type { CompositeKeyEntity } from "#src/models/streams/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity } from "#src/models/streams/AzureEntity";
import { selectResourceInResourceSchema } from "#src/schema/resource/resourcesInResource";
import { createAzureEntitySchema } from "#src/services/streams/createAzureEntitySchema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class SurveyResponseEntity extends AzureEntity {
  // Set while the respondent is still answering, and absent once they submit — the state every read of a survey's
  // Responses asks for. Declared, so a submitted row carries no key rather than an own `undefined`
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
  ...createAzureEntitySchema(z.object({ partitionKey: selectResourceInResourceSchema.shape.id, rowKey: z.uuidv4() }))
    .shape,
  isDraft: z.literal(true).optional(),
  model: z.record(z.string().min(1), z.unknown()),
  modelVersion: z.int().nonnegative(),
  pageNo: z.int().nonnegative(),
  participantToken: z.union([z.literal(""), z.uuidv4()]),
}) satisfies z.ZodType<ToData<SurveyResponseEntity>>;
