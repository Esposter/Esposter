import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { z } from "zod";

export interface DataSourceConfiguration<TDataSourceItem extends DataSourceItem> {
  accept: string;
  deserialize(file: File, item: TDataSourceItem): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, item: TDataSourceItem, mimeType: MimeType): Promise<Blob>;
}
