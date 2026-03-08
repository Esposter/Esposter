import { columnSchema } from "#shared/models/tableEditor/file/Column";
import { dateColumnSchema } from "#shared/models/tableEditor/file/DateColumn";
import { z } from "zod";

export const columnItemSchema = z.discriminatedUnion("type", [dateColumnSchema, columnSchema]);
