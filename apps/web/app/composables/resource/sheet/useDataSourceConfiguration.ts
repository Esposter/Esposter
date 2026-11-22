import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { DataSourceConfiguration } from "#src/models/resource/sheet/dataSource/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "#src/services/resource/sheet/dataSource/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TSheetSettings extends SheetSettings>(
  settings: MaybeRefOrGetter<TSheetSettings>,
) =>
  // The map holds each source's configuration over the widest settings, which a configuration over the caller's narrower
  // Settings accepts, since its methods take the settings they are given and the caller's are a subtype of that
  computed<DataSourceConfiguration<TSheetSettings>>(() => DataSourceConfigurationMap[toValue(settings).type]);
