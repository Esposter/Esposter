import type { TRPCRouter } from "#server/trpc/routers/index";
import type { surveyResponseModelSchema } from "#shared/models/db/survey/SurveyResponseModel";
import type { ResourceInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { v7 } from "uuid";
import { describe } from "vitest";

// A response is always the same envelope — one model under a fresh id — and the token is the only part an Anonymous
// Survey leaves empty, so it defaults to what the mode that does not use it sends
export const createSurveyResponse = (
  surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>,
  resourceId: ResourceInResource["id"],
  model: z.input<typeof surveyResponseModelSchema>,
  participantToken = "",
) => surveyCaller.createSurveyResponse({ id: v7(), isDraft: false, model, pageNo: 0, participantToken, resourceId });

describe.todo("createSurveyResponse");
