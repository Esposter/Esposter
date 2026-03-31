import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
// Maps each transformation type to its output ColumnType.
// ConvertTo is excluded because its output type is runtime-determined via targetType.
const ColumnTransformationTypeOutputTypeMap: Record<
  Exclude<ColumnTransformationType, ColumnTransformationType.ConvertTo>,
  ColumnType
> = {
  [ColumnTransformationType.Aggregation]: ColumnType.Number,
  [ColumnTransformationType.DatePart]: ColumnType.Number,
  [ColumnTransformationType.Math]: ColumnType.Number,
  [ColumnTransformationType.RegexMatch]: ColumnType.String,
  [ColumnTransformationType.String]: ColumnType.String,
  [ColumnTransformationType.StringPattern]: ColumnType.String,
  [ColumnTransformationType.StringSplit]: ColumnType.String,
} as const satisfies Record<Exclude<ColumnTransformationType, ColumnTransformationType.ConvertTo>, ColumnType>;

export const getComputedColumnEffectiveType = ({ transformation }: ComputedColumn): ColumnType =>
  transformation.type === ColumnTransformationType.ConvertTo
    ? transformation.targetType
    : ColumnTransformationTypeOutputTypeMap[transformation.type];
