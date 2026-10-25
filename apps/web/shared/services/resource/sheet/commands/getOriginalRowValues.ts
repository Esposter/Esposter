import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { takeOne, toRawDeep } from "@esposter/shared";

export const getOriginalRowValues = (dataSource: ToData<DataSource>, name: string) =>
  dataSource.rows.map((row) => takeOne(toRawDeep(row).data, name));
