import type { Component } from "vue";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export const formComponentMap: Partial<Record<DataSourceType, Component>> = {
  [DataSourceType.Csv]: defineAsyncComponent(() => import("@/components/TableEditor/File/Form/Csv.vue")),
};
