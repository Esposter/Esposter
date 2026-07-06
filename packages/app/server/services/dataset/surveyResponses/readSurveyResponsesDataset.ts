import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";
import type { Clause } from "@esposter/db-schema";

import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getSurveyModelDatasetColumns } from "@@/server/services/dataset/surveyResponses/getSurveyModelDatasetColumns";
import { toDatasetColumnValue } from "@@/server/services/dataset/surveyResponses/toDatasetColumnValue";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  SurveyResponseEntity,
} from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";

export const readSurveyResponsesDataset: DatasetProvider = async (ctx, reference) => {
  const survey = await ctx.db.query.surveys.findFirst({
    where: { id: { eq: reference.id }, userId: { eq: ctx.getSessionPayload.user.id } },
  });
  if (!survey) throw new TRPCError({ code: "UNAUTHORIZED" });

  const columns = getSurveyModelDatasetColumns(parseSurveyModel(survey.model));
  const clauses: Clause<SurveyResponseEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: reference.id },
  ];
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  const surveyResponses = await getTopNEntities(surveyResponseClient, AZURE_MAX_PAGE_SIZE, SurveyResponseEntity, {
    filter: serializeClauses(clauses),
  });
  const rows = surveyResponses.map(({ model }) =>
    Object.fromEntries(columns.map(({ name }) => [name, toDatasetColumnValue(model[name])])),
  );
  return { columns, rows };
};
