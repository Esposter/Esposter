import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

// The column types a dataset holds, a computed column being served as the type it yields. The type and the schema both
// Read this one list, so a member cannot sit in one of them and be missing from the other
const DatasetColumnTypes = [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String] as const;

export type DatasetColumnType = (typeof DatasetColumnTypes)[number];

export const datasetColumnTypeSchema = z.enum(DatasetColumnTypes) satisfies z.ZodType<DatasetColumnType>;
