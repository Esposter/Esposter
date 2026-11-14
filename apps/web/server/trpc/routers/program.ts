import type { GeneratedProgramParticipants } from "#shared/models/resource/program/GeneratedProgramParticipants";
import type { ProgramInvites } from "#shared/models/resource/program/ProgramInvites";
import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";
import type { ProgramStatus } from "#shared/models/resource/program/ProgramStatus";

import { generateProgramParticipants } from "#server/services/program/generateProgramParticipants";
import { issueProgramInvites } from "#server/services/program/issueProgramInvites";
import { readProgramStatusRows } from "#server/services/program/readProgramStatusRows";
import { regenerateProgramParticipantTokens } from "#server/services/program/regenerateProgramParticipantTokens";
import { router } from "#server/trpc";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { regenerateProgramParticipantTokenInputSchema } from "#shared/models/db/program/RegenerateProgramParticipantTokenInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { DatabaseEntityType, McpScope, ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { z } from "zod";

export const programRouter = router({
  ...createResourceProcedures(ResourceType.Program),
  // Answers only the credentials issued by this run: a participant already holding one keeps it, and its link is not
  // Answered again, since no read can give it back
  generateProgramParticipants: getOwnerProcedure(ResourceType.Program, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Issue one participant token per member of a program's audience that has none yet. Answers the tokens issued by this run, and nothing on a repeat that finds no new member.",
        scope: McpScope.Resources,
      },
    })
    .mutation<GeneratedProgramParticipants>(({ ctx }) => generateProgramParticipants(ctx, ctx.resource.id)),
  // The invite export issues each participant in scope a new link, the one answer besides generation that carries links
  // Scoped to the still-awaiting for the reminder, so the reminder never re-sends a responder
  issueProgramInvites: getOwnerProcedure(
    ResourceType.Program,
    z.object({ ...resourceIdInputSchema.shape, scope: z.enum(ProgramInviteScope) }),
    "id",
  )
    .meta({ humanOnly: "Issues participants new links, so every link already sent to them stops working" })
    .mutation<ProgramInvites>(({ ctx, input }) => issueProgramInvites(ctx, ctx.resource, input.scope)),
  // Owner-only and deliberately never a dataset — keyValue answers "who hasn't answered yet",
  // Which is blade work, not chart work.
  // Projected down to what the blade renders: the join's publicId is the dataset's identity and nothing on
  // This surface reads it, so the response carries no participant identifier the owner is not being shown
  readProgramStatus: getOwnerProcedure(ResourceType.Program, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Read a program's status: which of its audience has answered and which has not, with no participant credentials. Answers the status.",
        scope: McpScope.Resources,
      },
    })
    .query<ProgramStatus>(async ({ ctx }) => {
      const { isRespondedPartial, rows } = await readProgramStatusRows(ctx.db, ctx.resource);
      return {
        isRespondedPartial,
        rows: rows.map(({ addedAt, isResponded, keyValue }) => ({ addedAt, isResponded, keyValue })),
      };
    }),
  regenerateProgramParticipantToken: getOwnerProcedure(
    ResourceType.Program,
    regenerateProgramParticipantTokenInputSchema,
    "id",
  )
    .meta({ humanOnly: "Issues one participant a new link, so the link already sent to them stops working" })
    .mutation<ProgramParticipant>(async ({ ctx, input: { keyValue } }) => {
      const participant = await requireEntity(
        ctx.db.query.programParticipantsInResource.findFirst({
          where: { keyValue: { eq: keyValue }, resourceId: { eq: ctx.resource.id } },
        }),
        DatabaseEntityType.ProgramParticipant,
        keyValue,
      );
      const [regeneration] = await regenerateProgramParticipantTokens(ctx.db, [participant]);
      return {
        keyValue,
        token: requireMutation(regeneration, Operation.Update, DatabaseEntityType.ProgramParticipant, keyValue).token,
      };
    }),
});
