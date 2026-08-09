import { PasteRangeCommand } from "@/models/resource/sheet/commands/PasteRangeCommand";
import { toRawDeep } from "@esposter/shared";

export const usePasteRange = () =>
  useSheetCommand(
    (
      dataSource,
      anchorRowIndex: number,
      anchorColumnIndex: number,
      pastedValues: string[][],
      targetColumnNames: string[],
    ) => {
      const originalRows = dataSource.rows
        .slice(anchorRowIndex, anchorRowIndex + pastedValues.length)
        .map((row) => structuredClone(toRawDeep(row)));
      return new PasteRangeCommand(anchorRowIndex, anchorColumnIndex, pastedValues, targetColumnNames, originalRows);
    },
  );
