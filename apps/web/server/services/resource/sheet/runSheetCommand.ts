import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { RunSheetCommandInput } from "#shared/models/db/resource/sheet/RunSheetCommandInput";
import type { ResourceInResource } from "@esposter/db-schema";

import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { UpdateColumnCommand } from "#shared/models/resource/sheet/commands/UpdateColumnCommand";
import { UpdateRowCommand } from "#shared/models/resource/sheet/commands/UpdateRowCommand";
import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { exhaustiveGuard, Operation, takeOne, toRawDeep } from "@esposter/shared";

// Runs the editor's own command over the Sheet as `updateResourceContent` hands it, so a command naming a column or
// A row by id lands on the content the owner has now. A pinned version refuses it once the Sheet has moved past it.
// Answers the Sheet's new contentVersion
export const runSheetCommand = async (
  ctx: AuthedContext,
  resource: ResourceInResource,
  { command, contentVersion }: RunSheetCommandInput,
): Promise<number> => {
  const { resource: savedResource } = await updateResourceContent(
    ctx,
    resource,
    (storedContent) => {
      if (storedContent === null) throw getNotFoundError("Sheet", resource.id);
      const sheet = sheetResourceSchema.parse(storedContent);
      switch (command.type) {
        case CommandType.UpdateColumn: {
          if (!sheet.data.columns.some(({ name }) => name === command.name))
            throw getNotFoundError("Column", command.name);
          const { name: updatedName } = command.updatedColumn;
          if (updatedName !== command.name && sheet.data.columns.some(({ name }) => name === updatedName))
            throw getInvalidOperationError(
              Operation.Update,
              command.name,
              `a column named "${updatedName}" already exists`,
            );
          new UpdateColumnCommand(command.name, command.updatedColumn).execute(sheet.data);
          break;
        }
        case CommandType.UpdateRow: {
          // The row is found by id in the Sheet as it is now, so a row inserted above it does not move the command
          const index = sheet.data.rows.findIndex(({ id }) => id === command.rowId);
          if (index === -1) throw getNotFoundError("Row", command.rowId);
          for (const columnName of Object.keys(command.data))
            if (!sheet.data.columns.some(({ name }) => name === columnName))
              throw getNotFoundError("Column", columnName);
          const originalRow = structuredClone(toRawDeep(takeOne(sheet.data.rows, index)));
          const updatedRow = { ...originalRow, data: { ...originalRow.data, ...command.data } };
          new UpdateRowCommand(index, originalRow, updatedRow).execute(sheet.data);
          break;
        }
        default:
          exhaustiveGuard(command);
      }
      return { content: sheet, result: undefined };
    },
    contentVersion,
  );
  return savedResource.contentVersion;
};
