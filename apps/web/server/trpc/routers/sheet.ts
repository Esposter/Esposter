import { runSheetCommand } from "#server/services/resource/sheet/runSheetCommand";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { McpScope } from "#shared/models/auth/McpScope";
import { runSheetCommandInputSchema } from "#shared/models/db/resource/sheet/RunSheetCommandInput";
import { ResourceType } from "@esposter/db-schema";

export const sheetRouter = router({
  ...createResourceProcedures(ResourceType.Sheet),
  runSheetCommand: getOwnerProcedure(ResourceType.Sheet, runSheetCommandInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Run one of the sheet editor's own commands on a Sheet, so every row changes as the editor would change it: rename a column, or change its type or its date format. Pass the contentVersion you read and the command is refused if the Sheet changed since; left out, it applies to the latest content. Answers the new contentVersion.",
        scope: McpScope.Resources,
      },
    })
    .mutation<{ contentVersion: number }>(async ({ ctx, input }) => ({
      contentVersion: await runSheetCommand(ctx, ctx.resource, input),
    })),
});
