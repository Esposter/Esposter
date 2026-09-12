import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ColumnTransformationComputeContext } from "@/models/resource/sheet/column/transformation/ColumnTransformationComputeContext";

export type ColumnTransformationComputer<T extends ColumnTransformation> = (
  transformation: T,
  context: ColumnTransformationComputeContext,
) => ColumnValue;
