import type { Resource } from "@esposter/db-schema";

import { getPartitionKeyFilter } from "@esposter/db";

// The one definition of "this program's participants" — the capped read, the count that follows it and the
// Idempotent generate must select the same rows, or each would answer for a different question than the others
export const getProgramParticipantFilter = (programId: Resource["id"]): string => getPartitionKeyFilter(programId);
