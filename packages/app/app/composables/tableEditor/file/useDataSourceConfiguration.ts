import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/dataSource/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";

export const useDataSourceConfiguration = <TDataSourceItem extends DataSourceItem>(
  item: MaybeRefOrGetter<TDataSourceItem>,
): ComputedRef<DataSourceConfiguration<TDataSourceItem>> =>
  computed(() => DataSourceConfigurationMap[toValue(item).type] as DataSourceConfiguration<TDataSourceItem>);
