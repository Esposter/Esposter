import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export interface IParser {
  parse(file: File): Promise<DataSource>;
}
