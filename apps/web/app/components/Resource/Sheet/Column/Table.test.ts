// @vitest-environment nuxt
import ResourceSheetColumnTable from "@/components/Resource/Sheet/Column/Table.vue";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSheetColumnTable", () => {
  const name = "name";

  // Both dialogs are targeted by column name, and a rename or a delete under an open one leaves the target
  // Naming a column that no longer exists — the dialog then re-opens by itself the moment that name comes back
  test("drops a dialog target whose column leaves the sheet", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createDataSource([createColumn(name)]));
    await mountSuspended(ResourceSheetColumnTable, { props: { dataSource }, shallow: true });
    const columnDialogStore = useColumnDialogStore();
    const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
    chartingColumnName.value = name;
    editingColumnName.value = name;
    await nextTick();
    dataSource.columns = [];
    await nextTick();

    expect(chartingColumnName.value).toBe("");
    expect(editingColumnName.value).toBe("");
  });
});
