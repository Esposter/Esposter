import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";
import type { Clause } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getSurveyModelDatasetColumns } from "@@/server/services/dataset/surveyResponses/getSurveyModelDatasetColumns";
import { toDatasetColumnValue } from "@@/server/services/dataset/surveyResponses/toDatasetColumnValue";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ResourceType,
  SurveyResponseEntity,
} from "@esposter/db-schema";
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

  // The blob is written on first save, so a freshly created survey serves an empty dataset
  const content = await readResourceContent(ResourceDefinitionMap[ResourceType.Survey].contentSchema, resource.id);
  const columns = getSurveyModelDatasetColumns(parseSurveyModel(content?.model ?? ""));
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
