import type { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const CsvColumnHeaders: DataTableHeader<CsvColumn>[] = [
  { key: "sourceName", title: "Source Field" },
  { key: "name", title: "Name" },
  { key: "type", title: "Type" },
];
