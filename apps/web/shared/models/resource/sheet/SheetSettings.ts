import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";
import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { csvFileSettingsSchema } from "#shared/models/resource/sheet/CsvFileSettings";
import { jsonFileSettingsSchema } from "#shared/models/resource/sheet/JsonFileSettings";
import { xlsxFileSettingsSchema } from "#shared/models/resource/sheet/XlsxFileSettings";
import { z } from "zod";

export type SheetSettings = CsvFileSettings | JsonFileSettings | XlsxFileSettings;

export const sheetSettingsSchema = z.discriminatedUnion("type", [
  csvFileSettingsSchema,
  jsonFileSettingsSchema,
  xlsxFileSettingsSchema,
]) satisfies z.ZodType<SheetSettings>;
