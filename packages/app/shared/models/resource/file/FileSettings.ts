import type { CsvFileSettings } from "#shared/models/resource/file/CsvFileSettings";
import type { JsonFileSettings } from "#shared/models/resource/file/JsonFileSettings";
import type { XlsxFileSettings } from "#shared/models/resource/file/XlsxFileSettings";

import { csvFileSettingsSchema } from "#shared/models/resource/file/CsvFileSettings";
import { jsonFileSettingsSchema } from "#shared/models/resource/file/JsonFileSettings";
import { xlsxFileSettingsSchema } from "#shared/models/resource/file/XlsxFileSettings";
import { z } from "zod";

export type FileSettings = CsvFileSettings | JsonFileSettings | XlsxFileSettings;

export const fileSettingsSchema = z.discriminatedUnion("type", [
  csvFileSettingsSchema,
  jsonFileSettingsSchema,
  xlsxFileSettingsSchema,
]) satisfies z.ZodType<FileSettings>;
