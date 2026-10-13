import type { GeneratedProgramParticipants } from "#shared/models/resource/program/GeneratedProgramParticipants";
import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ProgramStatus } from "#shared/models/resource/program/ProgramStatus";

import { generateProgramParticipants } from "#server/services/program/generateProgramParticipants";
import { readProgramInvites } from "#server/services/program/readProgramInvites";
import { readProgramStatusRows } from "#server/services/program/readProgramStatusRows";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { ResourceType } from "@esposter/db-schema";
import { z } from "zod";

export const programRouter = router({
  ...createResourceProcedures(ResourceType.Program),
  generateProgramParticipants: getOwnerProcedure(
    ResourceType.Program,
    resourceIdInputSchema,
    "id",
  ).mutation<GeneratedProgramParticipants>(({ ctx }) => generateProgramParticipants(ctx, ctx.resource.id)),
  // The invite export is the one read that carries tokens, and only the owner reads it, the same as the CSV the
  // Mutation hands over. Scoped to the still-awaiting for the reminder, so the reminder never re-sends a responder
  readProgramInvites: getOwnerProcedure(
    ResourceType.Program,
    z.object({ ...resourceIdInputSchema.shape, scope: z.enum(ProgramInviteScope) }),
    "id",
  ).query<ProgramInvites>(({ ctx, input }) => readProgramInvites(ctx, ctx.resource, input.scope)),
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
