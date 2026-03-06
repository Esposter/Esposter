import type { Column } from "#shared/models/tableEditor/file/Column";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  metadata: Metadata;
  columns: Column[];
  rows: Record<string, string | number | boolean | null>[];
}
