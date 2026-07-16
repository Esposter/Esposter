import type { Clause, Resource } from "@esposter/db-schema";

import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { countEntities, serializeClauses } from "@esposter/db";
import { AzureTable, BinaryOperator, CompositeKeyPropertyNames, ProgramParticipantEntity } from "@esposter/db-schema";

// The uncapped participant count behind the row-cap warning. Counting walks the whole partition, so this
// Is only ever worth calling once a capped read is known to have filled — see readProgramStatusDataset. The
// Count is bounded so a huge partition cannot stall the read, and the bound renders as "N+"
export const countProgramParticipantEntities = async (programId: Resource["id"]): Promise<number> => {
  const clauses: Clause<ProgramParticipantEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  return countEntities(programParticipantClient, { filter: serializeClauses(clauses) }, DATASET_MAX_COUNTED_ROWS);
};
