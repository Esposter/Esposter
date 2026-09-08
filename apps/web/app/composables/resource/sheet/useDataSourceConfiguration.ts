import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { DataSourceConfiguration } from "@/models/resource/sheet/dataSource/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TSheetSettings extends SheetSettings>(
  settings: MaybeRefOrGetter<TSheetSettings>,
): ComputedRef<DataSourceConfiguration<TSheetSettings>> =>
  // The map is keyed by the concrete settings type, and indexing it with the generic's own discriminant yields
  // The union of every entry rather than the one the caller's type parameter fixes
  computed(() => DataSourceConfigurationMap[toValue(settings).type] as DataSourceConfiguration<TSheetSettings>);
