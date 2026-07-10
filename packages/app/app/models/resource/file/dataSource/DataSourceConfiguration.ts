import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { FileSettings } from "#shared/models/resource/file/FileSettings";
import type { z } from "zod";
/* oxlint-disable typescript/method-signature-style -- method signatures required for bivariant parameter checking so DataSourceConfiguration<Subtype> is assignable to DataSourceConfiguration<FileSettings> in the map */
export interface DataSourceConfiguration<TFileSettings extends FileSettings> {
  accept: string;
  deserialize(file: File, settings: TFileSettings): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, settings: TFileSettings, mimeType: MimeType): Promise<Blob>;
}
