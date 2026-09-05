// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import ResourceSheetColumnTable from "@/components/Resource/Sheet/Column/Table.vue";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("resourceSheetColumnTable", () => {
  let wrapper: VueWrapper;
  const name = "name";

  afterEach(() => {
    wrapper?.unmount();
  });

  // Both dialogs are targeted by column name, and a rename or a delete under an open one leaves the target
  // Naming a column that no longer exists — the dialog then re-opens by itself the moment that name comes back
  test("drops a dialog target whose column leaves the sheet", async () => {
    expect.hasAssertions();

    const dataSource = reactive(createDataSource([createColumn(name)]));
    wrapper = await mountSuspended(ResourceSheetColumnTable, { props: { dataSource }, shallow: true });
    const columnDialogStore = useColumnDialogStore();
    columnDialogStore.chartingColumnName = name;
    columnDialogStore.editingColumnName = name;
    await nextTick();
    dataSource.columns = [];
    await nextTick();

    expect(columnDialogStore.chartingColumnName).toBe("");
    expect(columnDialogStore.editingColumnName).toBe("");
  });
});
