import type { ResourceInResource } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { getPartitionClauses, getTopNEntities } from "@esposter/db";
import { StreamTable, ProgramParticipantEntity } from "@esposter/db-schema";

// The one capped read of a program's participants, shared by the status join and the token generator. Every
// Participant shares the program's partition, so the cap is a page size rather than a filter — a participant
// Past it is one this read did not see, and what that means is the caller's to answer
export const readProgramParticipantEntities = async (
  programId: ResourceInResource["id"],
): Promise<ProgramParticipantEntity[]> => {
  const programParticipantClient = useStreamTableClient(StreamTable.ProgramParticipants);
  return getTopNEntities(
    programParticipantClient,
    AZURE_MAX_PAGE_SIZE,
    ProgramParticipantEntity,
    getPartitionClauses(programId),
  );
};
