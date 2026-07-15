import type { CountSurveyResponsesOutput } from "#shared/models/resource/survey/CountSurveyResponsesOutput";
import type { Clause, Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  SurveyResponseEntity,
} from "@esposter/db-schema";

// Counts keys-only rows up to one past the cap — that extra key is what distinguishes exactly-cap
// From beyond-cap, which is the only thing isCapped needs to be honest about
export const countSurveyResponses = async (surveyId: Resource["id"]): Promise<CountSurveyResponsesOutput> => {
  const clauses: Clause<SurveyResponseEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: surveyId },
  ];
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  let count = 0;
  // Azure caps a page at AZURE_MAX_PAGE_SIZE, so "one past the cap" is the second page existing at all —
  // Which short-circuits immediately, keeping this to two requests at worst
  for await (const page of surveyResponseClient
    .listEntities({
      queryOptions: { filter: serializeClauses(clauses), select: [CompositeKeyPropertyNames.rowKey] },
    })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })) {
    count += page.length;
    if (count > AZURE_MAX_PAGE_SIZE) return { count: AZURE_MAX_PAGE_SIZE, isCapped: true };
  }
  return { count, isCapped: false };
};
