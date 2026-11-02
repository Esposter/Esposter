import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

// The column types a dataset holds, a computed column being served as the type it yields. The type and the schema both
// Read this one list, so a member cannot sit in one of them and be missing from the other
const DATASET_COLUMN_TYPES = [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String] as const;

export type DatasetColumnType = (typeof DATASET_COLUMN_TYPES)[number];

export const datasetColumnTypeSchema = z.enum(DATASET_COLUMN_TYPES) satisfies z.ZodType<DatasetColumnType>;
