import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { StringTransformationCommand } from "@/models/resource/sheet/commands/StringTransformationCommand";
import { getStringColumnsAffectedCells } from "@/services/resource/sheet/commands/getStringColumnsAffectedCells";

export const useStringTransformation = () =>
  useSheetCommand((dataSource, stringTransformationType: StringTransformationType) => {
    const affectedCells = getStringColumnsAffectedCells(dataSource);
    if (affectedCells.length === 0) return undefined;
    return new StringTransformationCommand(stringTransformationType, affectedCells);
  });
