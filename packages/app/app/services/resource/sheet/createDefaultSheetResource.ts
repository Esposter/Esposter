import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
// The content blob is written on first save, so a fresh Sheet resource starts from this default shape
export const createDefaultSheetResource = (): SheetResource => ({
  data: {
    columns: [],
    metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
    rows: [],
  },
  settings: createDefaultSheetSettings(DataSourceType.Csv),
});
