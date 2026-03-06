import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export interface IParser<TOptions> {
  parse(file: File, options: TOptions): Promise<DataSource>;
}
