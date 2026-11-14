import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { programParticipantsInResource } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { eq } from "drizzle-orm";

// The one capped read of a program's participants, shared by the status join and the token generator. Every
// Participant shares the program's id, so the cap is a page size rather than a filter — a participant past it is one
// This read did not see, and what that means is the caller's to answer
export const readProgramParticipantEntities = (db: Context["db"], programId: ResourceInResource["id"]) =>
  db
    .select()
    .from(programParticipantsInResource)
    .where(eq(programParticipantsInResource.resourceId, programId))
    .limit(MAX_READ_LIMIT);
