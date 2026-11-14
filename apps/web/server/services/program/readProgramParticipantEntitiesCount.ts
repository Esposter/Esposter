import type { ResourceInResource } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { getPartitionClauses, readEntitiesCount } from "@esposter/db";
import { StreamTable } from "@esposter/db-schema";

// The uncapped participant count behind the row-cap warning. Counting walks the whole partition, so this
// Is only ever worth calling once a capped read is known to have filled — see readProgramStatusDataset. The
// Count is bounded so a huge partition cannot stall the read, and the bound renders as "N+"
export const readProgramParticipantEntitiesCount = async (programId: ResourceInResource["id"]): Promise<number> => {
  const programParticipantClient = useStreamTableClient(StreamTable.ProgramParticipants);
  return readEntitiesCount(programParticipantClient, getPartitionClauses(programId), DATASET_MAX_COUNTED_ROWS);
};
