import type { GeneratedProgramParticipants } from "#shared/models/resource/program/GeneratedProgramParticipants";
import type { ProgramStatus } from "#shared/models/resource/program/ProgramStatus";

import { generateProgramParticipants } from "#server/services/program/generateProgramParticipants";
import { readProgramStatusRows } from "#server/services/program/readProgramStatusRows";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ResourceType } from "@esposter/db-schema";

export const programRouter = router({
  ...createResourceProcedures(ResourceType.Program),
  generateProgramParticipants: getOwnerProcedure(
    ResourceType.Program,
    resourceIdInputSchema,
    "id",
  ).mutation<GeneratedProgramParticipants>(({ ctx }) => generateProgramParticipants(ctx, ctx.resource.id)),
  // Owner-only and deliberately never a dataset — keyValue answers "who hasn't answered yet",
  // Which is blade work, not chart work.
  // Projected down to what the blade renders: the join's publicId is the dataset's identity and nothing on
  // This surface reads it, so the response carries no participant identifier the owner is not being shown
  readProgramStatus: getOwnerProcedure(ResourceType.Program, resourceIdInputSchema, "id").query<ProgramStatus>(
    async ({ ctx }) => {
      const { isRespondedPartial, rows } = await readProgramStatusRows(ctx.db, ctx.resource);
      return {
        isRespondedPartial,
        rows: rows.map(({ addedAt, isResponded, keyValue }) => ({ addedAt, isResponded, keyValue })),
      };
    },
  ),
});
