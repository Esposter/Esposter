import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { readCappedCount } from "#server/services/db/readCappedCount";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { programParticipantsInResource } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The uncapped participant count behind the row-cap warning. Counting walks the whole program's audience, so this
// Is only ever worth calling once a capped read is known to have filled — see readProgramStatusDataset. The
// Count is bounded so a huge audience cannot stall the read, and the bound renders as "N+"
export const readProgramParticipantEntitiesCount = (
  db: Context["db"],
  programId: ResourceInResource["id"],
): Promise<number> =>
  readCappedCount(
    db,
    programParticipantsInResource,
    eq(programParticipantsInResource.resourceId, programId),
    DATASET_MAX_COUNTED_ROWS,
  );
