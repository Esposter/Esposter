import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { createColumn } from "@/composables/tableEditor/file/commands/createColumn.test";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";
import { createRow } from "@/composables/tableEditor/file/commands/createRow.test";
import { setupEditedItem } from "@/composables/tableEditor/file/commands/setupEditedItem.test";
import { describe } from "vitest";

export const setupWithDataSource = (dataSource?: DataSource) => {
  const { editedItem, item } = setupEditedItem();
  const ds =
    dataSource ??
    createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 2, " ": 3 })],
    );
  const setDataSource = useSetDataSource();
  setDataSource(ds);
  return { editedItem, item };
};

describe.todo("setupWithDataSource");
