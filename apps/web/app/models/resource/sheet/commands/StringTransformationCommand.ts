import type { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { computeStringTransformation } from "@/services/resource/sheet/column/transformation/string/computeStringTransformation";
import { writeAffectedCells } from "@/services/resource/sheet/commands/writeAffectedCells";

export class StringTransformationCommand extends ADataSourceCommand<CommandType.StringTransformation> {
  readonly type = CommandType.StringTransformation;

  get description() {
    return `Format Strings (${this.#stringTransformationType})`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #stringTransformationType: StringTransformationType;

  constructor(stringTransformationType: StringTransformationType, affectedCells: AffectedCell[]) {
    super();
    this.#stringTransformationType = stringTransformationType;
    this.#affectedCells = affectedCells;
  }

  execute(dataSource: DataSource) {
    writeAffectedCells(dataSource, this.#affectedCells, ({ originalValue }) =>
      computeStringTransformation(String(originalValue), this.#stringTransformationType),
    );
  }

  undo(dataSource: DataSource) {
    writeAffectedCells(dataSource, this.#affectedCells, ({ originalValue }) => originalValue);
  }
}
