import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { readCappedCount } from "#server/services/db/readCappedCount";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { programParticipantsInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The participant count behind the row-cap warning. Counting walks the whole program's audience, so this is only ever
// Worth calling once a capped read is known to have filled — see readProgramStatusDataset. The count is bounded so a
// Huge audience cannot stall the read, and isCapped says the true total is higher
export const readProgramParticipantEntitiesCount = (db: Context["db"], programId: ResourceInResource["id"]) =>
  readCappedCount(
    db,
    programParticipantsInResource,
    eq(programParticipantsInResource.resourceId, programId),
    DATASET_MAX_COUNTED_ROWS,
  );
