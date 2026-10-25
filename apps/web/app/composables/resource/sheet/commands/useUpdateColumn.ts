import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { UpdateColumnCommand } from "#shared/models/resource/sheet/commands/UpdateColumnCommand";
import { toRawDeep } from "@esposter/shared";

export const useUpdateColumn = () =>
  useSheetCommand((dataSource, originalName: string, updatedColumn: ToData<Column>) => {
    if (dataSource.columns.some(({ name }) => name === originalName))
      return new UpdateColumnCommand(originalName, structuredClone(toRawDeep(updatedColumn)));
    else return undefined;
  });
