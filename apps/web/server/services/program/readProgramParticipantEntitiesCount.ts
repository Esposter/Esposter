import type { Resource } from "@esposter/db-schema";

import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getPartitionKeyFilter } from "@esposter/azure";
import { readEntitiesCount } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";

// The uncapped participant count behind the row-cap warning. Counting walks the whole partition, so this
// Is only ever worth calling once a capped read is known to have filled — see readProgramStatusDataset. The
// Count is bounded so a huge partition cannot stall the read, and the bound renders as "N+"
export const readProgramParticipantEntitiesCount = async (programId: Resource["id"]): Promise<number> => {
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  return readEntitiesCount(
    programParticipantClient,
    { filter: getPartitionKeyFilter(programId) },
    DATASET_MAX_COUNTED_ROWS,
  );
};
