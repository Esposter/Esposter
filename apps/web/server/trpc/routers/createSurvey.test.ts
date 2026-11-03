import type { TRPCRouter } from "#server/trpc/routers";
import type { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { SurveyDocument } from "survey-engine";
import type { z } from "zod";

import { SurveyNodeType, surveyDocumentSchema } from "survey-engine";
import { describe } from "vitest";

// A survey with its content written — the shape every suite that answers one or binds a program to it starts
// From. The content is the schema's input, so a suite that wants the prefaulted settings passes the document alone
export const createSurvey = async (
  surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>,
  name: string,
  content: z.input<typeof surveyResourceSchema>,
): Promise<ResourceInResource> => {
  const newResource = await surveyCaller.createResource({ name });
  await surveyCaller.saveResourceContent({ content, contentVersion: newResource.contentVersion, id: newResource.id });
  return newResource;
};

// A survey document whose one page holds a question of each given name and kind. The schema parses it, so each
// Question takes its kind's defaults and a fresh id the document requires to be unique
export const createSurveyDocumentWith = (questions: { name: string; type: SurveyNodeType }[]): SurveyDocument =>
  surveyDocumentSchema.parse({
    content: [
      {
        props: {
          children: questions.map(({ name, type }) => ({ props: { id: crypto.randomUUID(), name }, type })),
          id: crypto.randomUUID(),
        },
        type: SurveyNodeType.Page,
      },
    ],
    root: { props: {} },
  });

describe.todo("createSurvey");
