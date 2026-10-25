import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { columnSchema } from "#shared/models/resource/sheet/column/Column";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

// One of the sheet editor's own commands, named by its type. Each carries only what the editor's command takes, and
// Runs on the Sheet as it stands when the command lands
export const runSheetCommandInputSchema = z.object({
  command: z.discriminatedUnion("type", [
    z.object({
      name: aNamedItemEntitySchema.shape.name.meta({ description: "The column's name, as the Sheet has it now" }),
      type: z.literal(CommandType.UpdateColumn),
      updatedColumn: columnSchema.meta({
        description: "The column as it should be after the change: its name, its type and its format",
      }),
    }),
  ]),
  ...resourceIdInputSchema.shape,
  // The version the command was written against; left out, it applies to the latest content
  contentVersion: selectResourceInResourceSchema.shape.contentVersion.optional(),
});
export type RunSheetCommandInput = z.infer<typeof runSheetCommandInputSchema>;
