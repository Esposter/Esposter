import { aColumnSchema } from "#shared/models/tableEditor/file/AColumn";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

const pickedSchema = aColumnSchema.pick({ name: true, sourceName: true, type: true });

const columnSchema = pickedSchema.extend({
  name: pickedSchema.shape.name.describe("Field"),
  sourceName: pickedSchema.shape.sourceName.describe("Source Field"),
});

export const ColumnSchemaMap = {
  [DataSourceType.Csv]: columnSchema,
  [DataSourceType.Xlsx]: columnSchema,
} as const satisfies Record<DataSourceType, z.ZodObject>;
