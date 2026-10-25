import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { RunSheetCommandInput } from "#shared/models/db/resource/sheet/RunSheetCommandInput";
import type { ResourceInResource } from "@esposter/db-schema";

import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { UpdateColumnCommand } from "#shared/models/resource/sheet/commands/UpdateColumnCommand";
import { exhaustiveGuard } from "@esposter/shared";

// Runs the editor's own command over the Sheet as `updateResourceContent` hands it, so a command naming a column or
// a row by id lands on the content the owner has now. A pinned version refuses it once the Sheet has moved past it.
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
          new UpdateColumnCommand(command.name, command.updatedColumn).execute(sheet.data);
          break;
        }
        default:
          exhaustiveGuard(command.type);
      }
      return { content: sheet, result: undefined };
    },
    contentVersion,
  );
  return savedResource.contentVersion;
};
