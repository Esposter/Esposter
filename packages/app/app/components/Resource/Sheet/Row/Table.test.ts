// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import ResourceSheetRowTable from "@/components/Resource/Sheet/Row/Table.vue";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("resourceSheetRowTable", () => {
  let wrapper: VueWrapper;
  const name = "name";

  afterEach(() => {
    wrapper?.unmount();
  });

  // The dialog is targeted by row id, and a filter hiding the row under an open one leaves the target naming a
  // Row that is no longer on the table — the dialog then re-opens by itself the moment that row is back
  test("drops the edit target whose row leaves the filtered rows", async () => {
    expect.hasAssertions();

    const row = createRow({ [name]: "" });
    const dataSource = createDataSource([createColumn(name)], [row]);
    wrapper = await mountSuspended(ResourceSheetRowTable, { props: { dataSource }, shallow: true });
    // Resolved after the mount so they are the same stores the component injected from the nuxt app's pinia
    setupWithDataSource(dataSource);
    const rowDialogStore = useRowDialogStore();
    const filterStore = useFilterStore();
    rowDialogStore.editingId = row.id;
    await nextTick();
    const editingIdWhileVisible = rowDialogStore.editingId;
    filterStore.setColumnFilter(name, { type: ColumnType.String, value: " " });
    await nextTick();

    expect(editingIdWhileVisible).toBe(row.id);
    expect(rowDialogStore.editingId).toBe("");
  });
});
