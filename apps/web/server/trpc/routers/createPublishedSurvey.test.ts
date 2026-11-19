import type { TRPCRouter } from "#server/trpc/routers/index";
import type { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { createSurvey } from "#server/trpc/routers/createSurvey.test";
import { describe } from "vitest";

// A survey published as it is created, the state a response write is checked against
export const createPublishedSurvey = async (
  surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>,
  name: string,
  content: z.input<typeof surveyResourceSchema>,
): Promise<ResourceInResource> => {
  const survey = await createSurvey(surveyCaller, name, content);
  await surveyCaller.publishResource({ id: survey.id });
  return survey;
};

describe.todo("createPublishedSurvey");
