import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { useFileStore } from "@/store/resource/file";
import { describe } from "vitest";

export const setupWithDataSource = (dataSource?: DataSource) => {
  const fileStore = useFileStore();
  fileStore.fileResource.data =
    dataSource ??
    createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 2, " ": 3 })],
    );
  return { dataSource: fileStore.dataSource };
};

describe.todo("setupWithDataSource");
