import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { takeOne, toRawDeep } from "@esposter/shared";

export const getOriginalRowValues = (dataSource: DataSource, name: string) =>
  dataSource.rows.map((row) => takeOne(toRawDeep(row).data, name));
