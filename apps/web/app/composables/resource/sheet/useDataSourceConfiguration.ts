import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { DataSourceConfiguration } from "@/models/resource/sheet/dataSource/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TSheetSettings extends SheetSettings>(
  settings: MaybeRefOrGetter<TSheetSettings>,
): ComputedRef<DataSourceConfiguration<TSheetSettings>> =>
  computed(() => DataSourceConfigurationMap[toValue(settings).type] as DataSourceConfiguration<TSheetSettings>);
