import type { FileSettings } from "#shared/models/resource/file/FileSettings";
import type { DataSourceConfiguration } from "@/models/resource/file/dataSource/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/resource/file/dataSource/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TFileSettings extends FileSettings>(
  settings: MaybeRefOrGetter<TFileSettings>,
): ComputedRef<DataSourceConfiguration<TFileSettings>> =>
  computed(() => DataSourceConfigurationMap[toValue(settings).type] as DataSourceConfiguration<TFileSettings>);
