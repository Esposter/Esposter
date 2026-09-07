import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { describe } from "vitest";

export const JSON_MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Json].mimeType;

export const JSON_SETTINGS: JsonFileSettings = { configuration: {}, type: DataSourceType.Json };

describe.todo("constants");
