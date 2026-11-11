import type { XmlFileSettings } from "#shared/models/resource/sheet/XmlFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { describe } from "vitest";

export const XML_MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Xml].mimeType;

export const XML_SETTINGS: XmlFileSettings = { configuration: {}, type: DataSourceType.Xml };

describe.todo("constants");
