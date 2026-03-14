import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { MimeType } from "#shared/models/file/MimeType";
import type { z } from "zod";

export interface DataSourceConfiguration<TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]> {
  accept: string;
  deserialize(file: File, item: TDataSourceItem): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, item: TDataSourceItem, mimeType: MimeType): Promise<Blob>;
}
