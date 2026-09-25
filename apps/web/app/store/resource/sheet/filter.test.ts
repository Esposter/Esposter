// @vitest-environment nuxt
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { describe, expect, test } from "vitest";

describe(useFilterStore, () => {
  setupCommandTest();
  const filter = { type: ColumnType.String, value: "value" } as const;

  // A filter names its column, so one whose column the sheet no longer has would compare every row against a value
  // It does not hold and hide them all — with no header left to clear it from
  test("drops a filter whose column the sheet no longer has", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem();
    setupWithDataSource(createDataSource([createColumn("")], []));
    const filterStore = useFilterStore();
    const { setColumnFilter } = filterStore;
    const { columnFilters } = storeToRefs(filterStore);
    setColumnFilter("", filter);

    expect(columnFilters.value).toStrictEqual({ "": filter });

    setupWithDataSource(createDataSource([], []));

    expect(columnFilters.value).toStrictEqual({});
  });

  test("keeps a sheet's filters to that sheet", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem();
    setupWithDataSource(createDataSource([createColumn("")], []));
    const filterStore = useFilterStore();
    const { setColumnFilter } = filterStore;
    const { columnFilters } = storeToRefs(filterStore);
    setColumnFilter("", filter);
    resource.value = createResourceListItem();

    expect(columnFilters.value).toStrictEqual({});
  });
});
