import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { normalizeString } from "@esposter/shared";

// The create form takes any portable file rather than a format the user picked first, so the format map's
// Own `accept` extensions are what resolve it — a new format needs no change here
export const getDataSourceTypeByFileName = (fileName: string): DataSourceType | undefined => {
  const normalizedFileName = normalizeString(fileName).toLowerCase();
  return DataSourceTypes.find((type) =>
    DataSourceConfigurationMap[type].accept
      .split(",")
      .some((extension) => normalizedFileName.endsWith(normalizeString(extension).toLowerCase())),
  );
};
