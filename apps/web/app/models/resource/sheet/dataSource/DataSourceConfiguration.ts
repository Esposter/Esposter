import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { z } from "zod";
/* oxlint-disable typescript/method-signature-style -- method signatures required for bivariant parameter checking so DataSourceConfiguration<Subtype> is assignable to DataSourceConfiguration<SheetSettings> in the map */
export interface DataSourceConfiguration<TSheetSettings extends SheetSettings> {
  accept: string;
  deserialize(file: File, settings: TSheetSettings): Promise<DataSource>;
  mimeType: MimeType;
  schema: z.ZodObject;
  serialize(dataSource: DataSource, settings: TSheetSettings, mimeType: MimeType): Promise<Blob>;
}
