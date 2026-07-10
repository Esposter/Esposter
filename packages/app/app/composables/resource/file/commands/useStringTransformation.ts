import { StringTransformationType } from "#shared/models/resource/file/column/transformation/string/StringTransformationType";
import { StringTransformationCommand } from "@/models/resource/file/commands/StringTransformationCommand";
import { getStringColumnsAffectedCells } from "@/services/resource/file/commands/getStringColumnsAffectedCells";

export const useStringTransformation = () =>
  useFileCommand((dataSource, stringTransformationType: StringTransformationType) => {
    const affectedCells = getStringColumnsAffectedCells(dataSource);
    if (affectedCells.length === 0) return undefined;
    return new StringTransformationCommand(stringTransformationType, affectedCells);
  });
