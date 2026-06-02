import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { z } from "zod";
/* oxlint-disable typescript/method-signature-style -- method signatures required for bivariant parameter checking so DataSourceConfiguration<Subtype> is assignable to DataSourceConfiguration<DataSourceItem> in the map */
export interface DataSourceConfiguration<TDataSourceItem extends DataSourceItem> {
  accept: string;
  deserialize(file: File, item: TDataSourceItem): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, item: TDataSourceItem, mimeType: MimeType): Promise<Blob>;
}
