import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";

export const ColumnTypeCreateMap = {
  [ColumnType.Boolean]: {
    create: (init?: ToData<Except<Partial<BooleanColumn>, "type">>) => new BooleanColumn({ ...init }),
  },
  [ColumnType.Computed]: {
    create: (init?: ToData<Except<Partial<ComputedColumn>, "type">>) => new ComputedColumn({ ...init }),
  },
  [ColumnType.Date]: {
    create: (init?: ToData<Except<Partial<DateColumn>, "type">>) => new DateColumn({ ...init }),
  },
  [ColumnType.Number]: {
    create: (init?: ToData<Except<Partial<NumberColumn>, "type">>) => new NumberColumn({ ...init }),
  },
  [ColumnType.String]: {
    create: (init?: ToData<Except<Partial<StringColumn>, "type">>) => new StringColumn({ ...init }),
  },
} as const satisfies Record<ColumnType, { create: (init?: ToData<Except<Partial<BooleanColumn>, "type">>) => Column }>;
