import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";
import type { ProgramStatus } from "#shared/models/resource/program/ProgramStatus";

import { generateProgramParticipants } from "@@/server/services/program/generateProgramParticipants";
import { readProgramStatusRows } from "@@/server/services/program/readProgramStatusRows";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { ResourceType, selectResourceSchema } from "@esposter/db-schema";

const programIdInputSchema = selectResourceSchema.pick({ id: true });

export const programRouter = router({
  ...createResourceProcedures(ResourceType.Program),
  generateProgramParticipants: getOwnerProcedure(ResourceType.Program, programIdInputSchema, "id").mutation<
    ProgramParticipant[]
  >(({ ctx }) => generateProgramParticipants(ctx, ctx.resource.id)),
  // Owner-only and deliberately never a dataset — keyValue answers "who hasn't answered yet",
  // Which is blade work, not chart work.
  // Projected down to what the blade renders: the join's publicId is the dataset's identity and nothing on
  // This surface reads it, so the response carries no participant identifier the owner is not being shown
  readProgramStatus: getOwnerProcedure(ResourceType.Program, programIdInputSchema, "id").query<ProgramStatus>(
    async ({ ctx }) => {
      const { isRespondedPartial, rows } = await readProgramStatusRows(ctx.resource.id);
      return {
        isRespondedPartial,
        rows: rows.map(({ addedAt, isResponded, keyValue }) => ({ addedAt, isResponded, keyValue })),
      };
    },
  ),
});
