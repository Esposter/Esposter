import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { describe } from "vitest";

export const createComputedColumn = (
  name: string,
  sourceColumnId: string,
  transformation: ColumnTransformation = {
    sourceColumnId,
    targetType: ColumnType.String,
    type: ColumnTransformationType.ConvertTo,
  },
): ComputedColumn => new ComputedColumn({ name, size: 0, sourceName: name, transformation });

describe.todo("createComputedColumn");
