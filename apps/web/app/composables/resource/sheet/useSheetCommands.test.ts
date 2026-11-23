// @vitest-environment nuxt
import type { UiCommand } from "#src/models/ui/UiCommand";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetCommands } from "#src/composables/resource/sheet/useSheetCommands";
import { ArrowKeyDefinitionMap } from "#src/services/resource/sheet/ArrowKeyDefinitionMap";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useCommandStore } from "#src/store/ui/command";
import { assert, describe, expect, test } from "vitest";

// The sheet's commands are read back from the command store, the list the shortcuts dialog and the palette draw from
const runSheetCommand = (id: string) => {
  const commandStore = useCommandStore();
  const { commands } = storeToRefs(commandStore);
  const command: UiCommand | undefined = commands.value.find((registeredCommand) => registeredCommand.id === id);
  assert.exists(command?.run);
  command.run();
};

describe(useSheetCommands, () => {
  const sheetExtendDown = `sheet-extend-${ArrowKeyDefinitionMap.ArrowDown.direction}`;

  setupCommandTest();

  test("leaves the selection alone when the grid has no rows", () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("a")], []));
    const cellStore = useCellStore();
    const { selectedCellRange } = storeToRefs(cellStore);
    const { startCellSelection } = cellStore;
    // A focus left on a row the grid no longer holds
    startCellSelection(0, 0);
    const selectionBefore = selectedCellRange.value;
    effectScope().run(() => {
      useSheetCommands();
    });
    runSheetCommand(sheetExtendDown);

    expect(selectedCellRange.value).toStrictEqual(selectionBefore);
  });

  test("extends the selection one cell and holds it at the last row", () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("a")], [createRow({ a: "" }), createRow({ a: "" })]));
    const cellStore = useCellStore();
    const { focusedCell } = storeToRefs(cellStore);
    const { startCellSelection } = cellStore;
    startCellSelection(0, 0);
    effectScope().run(() => {
      useSheetCommands();
    });
    runSheetCommand(sheetExtendDown);

    expect(focusedCell.value).toStrictEqual({ columnIndex: 0, rowIndex: 1 });

    runSheetCommand(sheetExtendDown);

    expect(focusedCell.value).toStrictEqual({ columnIndex: 0, rowIndex: 1 });
  });
});
