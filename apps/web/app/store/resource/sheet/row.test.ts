// @vitest-environment nuxt
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useRowStore } from "@/store/resource/sheet/row";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useRowStore, () => {
  setupCommandTest();

  // The store outlives the sheet, so held once for the app every sheet opened after the first would open on its
  // Page, searched and sorted by its terms, with its row ids selected
  test("keeps a sheet's page, search, sort and selected rows to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const rowStore = useRowStore();
    const { page, search, selectedRowIds, sortBy } = storeToRefs(rowStore);
    page.value = 2;
    search.value = " ";
    selectedRowIds.value = [""];
    sortBy.value = [{ key: "", order: SortOrder.Asc }];
    resource.value = createResourceListItem();

    expect({
      page: page.value,
      search: search.value,
      selectedRowIds: selectedRowIds.value,
      sortBy: sortBy.value,
    }).toStrictEqual({ page: 1, search: "", selectedRowIds: [], sortBy: [] });
  });

  // A new filter starts the rows over, but a sheet opened again brings its own filters back, and the page it was on
  // With them
  test("keeps a sheet's page when it is opened again after a sheet with other filters", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], []));
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const firstResource = resource.value;
    const filterStore = useFilterStore();
    const { setColumnFilter } = filterStore;
    const rowStore = useRowStore();
    const { page } = storeToRefs(rowStore);
    page.value = 2;
    resource.value = createResourceListItem();
    setColumnFilter("", { type: ColumnType.String, value: "value" });
    await flushPromises();
    resource.value = firstResource;
    await flushPromises();

    expect(page.value).toBe(2);
  });
});
