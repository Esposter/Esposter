import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>(
  item: MaybeRefOrGetter<TDataSourceItem>,
): ComputedRef<DataSourceConfiguration<TDataSourceItem>> =>
  computed(() => DataSourceConfigurationMap[toValue(item).type] as DataSourceConfiguration<TDataSourceItem>);
