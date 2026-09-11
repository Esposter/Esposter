import type { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Resource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { describe } from "vitest";

// A survey with its content written — the shape every suite that answers one or binds a program to it starts
// From. The content is the schema's input, so a suite that wants the prefaulted settings passes the model alone
export const createSurvey = async (
  surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>,
  name: string,
  content: z.input<typeof surveyResourceSchema>,
): Promise<Resource> => {
  const newResource = await surveyCaller.createResource({ name });
  await surveyCaller.saveResourceContent({ content, contentVersion: newResource.contentVersion, id: newResource.id });
  return newResource;
};

describe.todo("createSurvey");
