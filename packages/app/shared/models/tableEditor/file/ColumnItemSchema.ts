import { columnSchema } from "#shared/models/tableEditor/file/Column";
import { computedColumnSchema } from "#shared/models/tableEditor/file/ComputedColumn";
import { dateColumnSchema } from "#shared/models/tableEditor/file/DateColumn";
import { z } from "zod";

export const columnItemSchema = z.discriminatedUnion("type", [computedColumnSchema, dateColumnSchema, columnSchema]);
