import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { describe } from "vitest";

// A sheet is only ever open as a loaded resource, and its view state — page, search, selection — is keyed by that
// Resource, so the helper loads one when the test has not
export const setupWithDataSource = (dataSource?: DataSource) => {
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  resource.value ??= createResourceListItem();
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
