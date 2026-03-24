import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";

import { ColumnTransformationTypeComputeMap } from "@/services/tableEditor/file/column/transformation/ColumnTransformationTypeComputeMap";

export const computeColumnTransformation = (value: ColumnValue, transformation: ColumnTransformation): ColumnValue =>
  ColumnTransformationTypeComputeMap[transformation.type].compute(value, transformation as never);
