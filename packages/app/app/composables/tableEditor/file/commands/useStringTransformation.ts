import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { StringTransformationCommand } from "@/models/tableEditor/file/commands/StringTransformationCommand";
import { getStringColumnsAffectedCells } from "@/services/tableEditor/file/commands/getStringColumnsAffectedCells";

export const useStringTransformation = () =>
  useTableEditorCommand((editedItem, stringTransformationType: StringTransformationType) => {
    const affectedCells = getStringColumnsAffectedCells(editedItem.dataSource);
    if (affectedCells.length === 0) return undefined;
    return new StringTransformationCommand(stringTransformationType, affectedCells);
  });
