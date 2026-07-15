import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { readSurveyResponseDatasetSource } from "@@/server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toSurveyResponseDatasetRow } from "@@/server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const readSurveyResponsesDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      id: { eq: reference.id },
      type: { eq: ResourceType.Survey },
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });

  const { columns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(resource.id);
  // The dataset contract carries no keys — row identity is the Responses blade's concern, and a
  // Dataset flows into publishable dashboards
  return { columns, rows: surveyResponses.map(({ model }) => toSurveyResponseDatasetRow(columns, model)), totalRows };
};
