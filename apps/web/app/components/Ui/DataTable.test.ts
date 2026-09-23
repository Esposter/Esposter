// @vitest-environment happy-dom
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import UiDataTable from "@/components/Ui/DataTable.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

interface Row {
  group: string;
  id: string;
  name: string;
}

describe("uiDataTable", () => {
  const label = "label";
  const columns: UiDataTableColumn<Row, "name">[] = [{ key: "name", title: "name" }];
  const items: Row[] = [
    { group: "group", id: "0", name: "0" },
    { group: "group", id: "1", name: "1" },
  ];
  const mountTable = (groupBy?: "group", onOpen?: (item: Row) => void) => {
    const component = mount(UiDataTable<Row, "name">, {
      props: {
        columns,
        getItemTitle: ({ name }: Row) => name,
        groupBy,
        isSelectable: true as const,
        items,
        itemsLength: 3,
        itemsPerPage: 2,
        itemsPerPageOptions: [2],
        label,
        onOpen,
        "onUpdate:page": (page: number) => component.setProps({ page }),
        "onUpdate:selectedIds": (selectedIds: string[]) => component.setProps({ selectedIds }),
        "onUpdate:sortBy": (sortBy: SortItem<"name">[]) => component.setProps({ sortBy }),
        page: 1,
        selectedIds: [],
        sortBy: [],
      },
    });
    return component;
  };

  test("sorts by a header ascending, then descending, and says which way", async () => {
    expect.hasAssertions();

    const component = mountTable();
    const header = component.get("th:not(:first-child)");

    expect(header.attributes("aria-sort")).toBeUndefined();

    await header.get("button").trigger("click");

    expect(component.props("sortBy")).toStrictEqual([{ key: "name", order: SortOrder.Asc }]);
    expect(header.attributes("aria-sort")).toBe("ascending");

    await header.get("button").trigger("click");

    expect(header.attributes("aria-sort")).toBe("descending");
  });

  test("selects a row by its named checkbox, and says the page is mixed until every row is", async () => {
    expect.hasAssertions();

    const component = mountTable();
    const [pageCheckbox, firstRowCheckbox] = component.findAll('[role="checkbox"]');

    expect(firstRowCheckbox?.attributes("aria-label")).toBe("Select 0");

    await firstRowCheckbox?.trigger("click");

    expect(component.props("selectedIds")).toStrictEqual(["0"]);
    expect(pageCheckbox?.attributes("aria-checked")).toBe("mixed");

    await pageCheckbox?.trigger("click");

    expect(component.props("selectedIds")).toStrictEqual(["0", "1"]);
    expect(pageCheckbox?.attributes("aria-checked")).toBe("true");
  });

  test("opens a row on Enter", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(item: Row) => void>();
    const component = mountTable(undefined, onOpen);
    await component.get("tbody tr").trigger("keydown", { key: "Enter" });

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(items[0]);
  });

  test("steps to the next page and no further than the last", async () => {
    expect.hasAssertions();

    const component = mountTable();
    const next = component.get('button[aria-label="Next page"]');
    await next.trigger("click");

    expect(component.props("page")).toBe(2);
    expect(next.attributes("disabled")).toBe("");
  });

  test("closes a group from its header, which says whether it is open", async () => {
    expect.hasAssertions();

    const component = mountTable("group");
    const groupHeader = component.get("button[aria-expanded]");

    expect(groupHeader.attributes("aria-expanded")).toBe("true");

    await groupHeader.trigger("click");

    expect(groupHeader.attributes("aria-expanded")).toBe("false");
    expect(component.findAll('[aria-label^="Select 0"]')).toHaveLength(0);
  });
});
