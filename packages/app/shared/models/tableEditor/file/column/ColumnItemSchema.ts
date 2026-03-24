import { columnSchema } from "#shared/models/tableEditor/file/column/Column";
import { computedColumnSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { z } from "zod";

export const columnItemSchema = z.discriminatedUnion("type", [computedColumnSchema, dateColumnSchema, columnSchema]);
