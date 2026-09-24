import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";

// Every file extension a sheet can be created from, and the one string a file input takes them as
export const DATA_SOURCE_ACCEPTS = DataSourceTypes.map((type) => DataSourceConfigurationMap[type].accept);
export const DATA_SOURCE_ACCEPT = DATA_SOURCE_ACCEPTS.join(",");
