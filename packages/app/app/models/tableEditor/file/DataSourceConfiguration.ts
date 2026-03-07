import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { z } from "zod";

export interface DataSourceConfiguration<TDataSourceItem extends ADataSourceItem<DataSourceType>> {
  accept: string;
  parse(file: File, item: TDataSourceItem): Promise<DataSource>;
  schema: z.core.JSONSchema.JSONSchema;
}
