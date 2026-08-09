import { Row } from "#shared/models/resource/sheet/datasource/Row";
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
      // Rehydrated, because the command declares Row[] and a bare clone is only structurally one - it would
      // Satisfy the type while carrying none of the class behaviour an undo may come to rely on
      const originalRows = dataSource.rows
        .slice(anchorRowIndex, anchorRowIndex + pastedValues.length)
        .map((row) => new Row(structuredClone(toRawDeep(row))));
      return new PasteRangeCommand(anchorRowIndex, anchorColumnIndex, pastedValues, targetColumnNames, originalRows);
    },
  );
