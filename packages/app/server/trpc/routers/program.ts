import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { generateProgramInvites } from "@@/server/services/program/generateProgramInvites";
import { readProgramStatusRows } from "@@/server/services/program/readProgramStatusRows";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { ResourceType, selectResourceSchema } from "@esposter/db-schema";

const programIdInputSchema = selectResourceSchema.pick({ id: true });

export const programRouter = router({
  ...createResourceProcedures(ResourceType.Program),
  generateProgramInvites: getOwnerProcedure(ResourceType.Program, programIdInputSchema, "id").mutation<ProgramInvite[]>(
    ({ ctx }) => generateProgramInvites(ctx, ctx.resource.id),
  ),
  // Owner-only and deliberately never a dataset — keyValue answers "who hasn't answered yet",
  // Which is blade work, not chart work
  readProgramStatus: getOwnerProcedure(ResourceType.Program, programIdInputSchema, "id").query<ProgramStatusRow[]>(
    ({ ctx }) => readProgramStatusRows(ctx.resource.id),
  ),
});
