import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { AZURE_MAX_PAGE_SIZE, getPartitionKeyFilter } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity } from "@esposter/db-schema";

// The one capped read of a program's participants, shared by the status join and the token generator. Every
// Participant shares the program's partition, so the cap is a page size rather than a filter — a participant
// Past it is one this read did not see, and what that means is the caller's to answer
export const readProgramParticipantEntities = async (
  programId: Resource["id"],
): Promise<ProgramParticipantEntity[]> => {
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  return getTopNEntities(programParticipantClient, AZURE_MAX_PAGE_SIZE, ProgramParticipantEntity, {
    filter: getPartitionKeyFilter(programId),
  });
};
