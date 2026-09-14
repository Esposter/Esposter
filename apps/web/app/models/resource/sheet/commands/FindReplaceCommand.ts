import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { writeAffectedCells } from "@/services/resource/sheet/commands/writeAffectedCells";
import { takeOne } from "@esposter/shared";

export class FindReplaceCommand extends ADataSourceCommand<CommandType.FindReplace> {
  readonly type = CommandType.FindReplace;

  get description() {
    const uniqueRowIndices = new Set(this.#affectedCells.map((cell) => cell.rowIndex));
    const location = uniqueRowIndices.size === 1 ? ` on row ${takeOne(this.#affectedCells).rowIndex + 1}` : " (all)";
    return `Find & Replace "${this.#findValue}" → "${this.#replaceValue}"${location}`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #findValue: string;
  readonly #replaceValue: string;

  constructor(findValue: string, replaceValue: string, affectedCells: AffectedCell[]) {
    super();
    this.#findValue = findValue;
    this.#replaceValue = replaceValue;
    this.#affectedCells = affectedCells;
  }

  execute(dataSource: DataSource) {
    writeAffectedCells(dataSource, this.#affectedCells, ({ originalValue }, column) => {
      const replacedString = String(originalValue).replaceAll(this.#findValue, this.#replaceValue);
      return column.type === ColumnType.String ? replacedString : coerceValue(replacedString, column.type);
    });
  }

  undo(dataSource: DataSource) {
    writeAffectedCells(dataSource, this.#affectedCells, ({ originalValue }) => originalValue);
  }
}
