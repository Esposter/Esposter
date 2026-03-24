import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";
import type { z } from "zod";

export interface DataSourceConfiguration<TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]> {
  accept: string;
  deserialize(file: File, item: TDataSourceItem): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, item: TDataSourceItem, mimeType: MimeType): Promise<Blob>;
}
