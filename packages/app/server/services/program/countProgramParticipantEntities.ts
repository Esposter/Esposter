import type { Clause, Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { countEntities, serializeClauses } from "@esposter/db";
import { AzureTable, BinaryOperator, CompositeKeyPropertyNames, ProgramParticipantEntity } from "@esposter/db-schema";

// The uncapped participant count behind the row-cap warning. Counting walks the whole partition, so this
// Is only ever worth calling once a capped read is known to have filled — see readProgramStatusDataset
export const countProgramParticipantEntities = async (programId: Resource["id"]): Promise<number> => {
  const clauses: Clause<ProgramParticipantEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  return countEntities(programParticipantClient, { filter: serializeClauses(clauses) });
};
