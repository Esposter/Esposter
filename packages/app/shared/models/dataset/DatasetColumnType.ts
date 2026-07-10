import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { z } from "zod";

export type DatasetColumnType = Exclude<ColumnType, ColumnType.Computed>;

export const datasetColumnTypeSchema = z.enum([
  ColumnType.Boolean,
  ColumnType.Date,
  ColumnType.Number,
  ColumnType.String,
]) satisfies z.ZodType<DatasetColumnType>;
