import { csvDataSourceItemSchema } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import { z } from "zod";

export const dataSourceItemSchema = z.discriminatedUnion("type", [csvDataSourceItemSchema]);
