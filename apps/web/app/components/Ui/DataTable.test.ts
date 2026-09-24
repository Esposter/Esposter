// @vitest-environment happy-dom
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";
import type { VueWrapper } from "@vue/test-utils";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import UiDataTable from "@/components/Ui/DataTable.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

interface Row {
  group: string;
  id: string;
  name: string;
}

const getRowTexts = (component: VueWrapper) =>
  component.findAll("tbody tr").map((row) => row.findAll("td").map((cell) => cell.text()));

describe("uiDataTable", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

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

    test("hands each header cell and data cell the props its call site gives them", () => {
      expect.hasAssertions();

      const component = mount(UiDataTable<Row, "name">, {
        props: {
          columns,
          getCellProps: ({ key }: UiDataTableColumn<Row, "name">, { id }: Row) => ({ "data-cell": `${key}${id}` }),
          getHeaderProps: ({ key }: UiDataTableColumn<Row, "name">) => ({ "data-header": key }),
          getItemTitle: ({ name }: Row) => name,
          items,
          label,
        },
      });

      expect(component.get("th").attributes("data-header")).toBe("name");
      expect(component.findAll("td").map((cell) => cell.attributes("data-cell"))).toStrictEqual(["name0", "name1"]);
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

    test("steps back to the last page when a removal leaves it past the end, and not before the first count", async () => {
      expect.hasAssertions();

      const component = mountTable();
      await component.setProps({ itemsLength: 0, page: 2 });

      expect(component.props("page")).toBe(2);

      await component.setProps({ itemsLength: 3 });
      await component.setProps({ itemsLength: 2 });

      expect(component.props("page")).toBe(1);
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

    describe("with every row", () => {
      interface Cell {
        id: string;
        name: string;
        value: string;
      }

      const cellColumns: UiDataTableColumn<Cell>[] = [
        { key: "name", title: "name" },
        { key: "value", title: "value" },
      ];
      const cells: Cell[] = [
        { id: "0", name: "1", value: "10" },
        { id: "1", name: "0", value: "9" },
        { id: "2", name: "0", value: "10" },
      ];
      const mountClientTable = (search = "") => {
        const component = mount(UiDataTable<Cell, string>, {
          props: {
            columns: cellColumns,
            getItemTitle: ({ name }: Cell) => name,
            isMultiSort: true as const,
            items: cells,
            itemsPerPage: 2,
            itemsPerPageOptions: [2, -1],
            label,
            "onUpdate:itemsPerPage": (itemsPerPage: number) => component.setProps({ itemsPerPage }),
            "onUpdate:page": (page: number) => component.setProps({ page }),
            "onUpdate:sortBy": (sortBy: SortItem<string>[]) => component.setProps({ sortBy }),
            page: 1,
            search,
            sortBy: [],
          },
        });
        return component;
      };

      test("pages every row itself", async () => {
        expect.hasAssertions();

        const component = mountClientTable();

        expect(getRowTexts(component)).toStrictEqual([
          ["1", "10"],
          ["0", "9"],
        ]);

        await component.get('button[aria-label="Next page"]').trigger("click");

        expect(getRowTexts(component)).toStrictEqual([["0", "10"]]);
      });

      test("sorts by one column then another, numbers as numbers", async () => {
        expect.hasAssertions();

        const component = mountClientTable();
        await component.setProps({ itemsPerPage: -1 });
        const [nameHeader, valueHeader] = component.findAll("th button");
        await nameHeader?.trigger("click");
        await valueHeader?.trigger("click");

        expect(component.props("sortBy")).toStrictEqual([
          { key: "name", order: SortOrder.Asc },
          { key: "value", order: SortOrder.Asc },
        ]);
        expect(getRowTexts(component)).toStrictEqual([
          ["0", "9"],
          ["0", "10"],
          ["1", "10"],
        ]);
      });

      test("shows only the rows a search finds in a cell, from the first page", async () => {
        expect.hasAssertions();

        const component = mountClientTable();
        await component.setProps({ page: 2, search: "9" });

        expect(component.props("page")).toBe(1);
        expect(getRowTexts(component)).toStrictEqual([["0", "9"]]);
      });
    });
  });
});
