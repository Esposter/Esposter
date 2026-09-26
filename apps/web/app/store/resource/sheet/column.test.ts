// @vitest-environment nuxt
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useColumnStore } from "@/store/resource/sheet/column";
import { describe, expect, test } from "vitest";

describe(useColumnStore, () => {
  setupCommandTest();

  test("keeps a sheet's column search, sort and selected columns to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const columnStore = useColumnStore();
    const { search, selectedColumnIds, sortBy } = storeToRefs(columnStore);
    search.value = " ";
    selectedColumnIds.value = [""];
    sortBy.value = [{ key: "", order: SortOrder.Asc }];
    resource.value = createResourceListItem();

    expect({ search: search.value, selectedColumnIds: selectedColumnIds.value, sortBy: sortBy.value }).toStrictEqual({
      search: "",
      selectedColumnIds: [],
      sortBy: [],
    });
  });
});
