import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { useSheetStore } from "@/store/resource/sheet";
import { describe } from "vitest";

export const setupWithDataSource = (dataSource?: DataSource) => {
  const sheetStore = useSheetStore();
  sheetStore.sheetResource.data =
    dataSource ??
    createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 2, " ": 3 })],
    );
  return { dataSource: sheetStore.dataSource };
};

describe.todo("setupWithDataSource");
