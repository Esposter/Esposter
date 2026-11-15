import type { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";

import { StringTransformationCommand } from "#src/models/resource/sheet/commands/StringTransformationCommand";
import { getStringColumnsAffectedCells } from "#src/services/resource/sheet/commands/getStringColumnsAffectedCells";

export const useStringTransformation = () =>
  useSheetCommand((dataSource, stringTransformationType: StringTransformationType) => {
    const affectedCells = getStringColumnsAffectedCells(dataSource);
    if (affectedCells.length === 0) return undefined;
    else return new StringTransformationCommand(stringTransformationType, affectedCells);
  });
