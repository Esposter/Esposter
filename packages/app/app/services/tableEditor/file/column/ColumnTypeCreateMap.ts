import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { Except } from "type-fest";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";

export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: {
    create: (init?: Partial<Except<BooleanColumn, "type">>) => new BooleanColumn({ ...init }),
  },
  [ColumnType.Computed]: {
    create: (init?: Partial<Except<ComputedColumn, "type">>) => new ComputedColumn({ ...init }),
  },
  [ColumnType.Date]: {
    create: (init?: Partial<Except<DateColumn, "type">>) => new DateColumn({ ...init }),
  },
  [ColumnType.Number]: {
    create: (init?: Partial<Except<NumberColumn, "type">>) => new NumberColumn({ ...init }),
  },
  [ColumnType.String]: {
    create: (init?: Partial<Except<StringColumn, "type">>) => new StringColumn({ ...init }),
  },
} as const satisfies {
  [K in ColumnType]: { create: (init?: Partial<Except<Extract<Column, { type: K }>, "type">>) => Column };
};
