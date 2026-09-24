import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { normalizeString } from "@esposter/shared";

// The create form takes any portable file rather than a format the user picked first, so the format map's
// Own `accept` extensions are what resolve it — a new format needs no change here
export const getDataSourceTypeByFilename = (filename: string) => {
  const normalizedFilename = normalizeString(filename).toLowerCase();
  return DataSourceTypes.find((type) =>
    DataSourceConfigurationMap[type].accept
      .split(",")
      .some((extension) => normalizedFilename.endsWith(normalizeString(extension).toLowerCase())),
  );
};
