// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import ResourceSheetRowFooterSlot from "@/components/Resource/Sheet/Row/FooterSlot.vue";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { useRowStore } from "@/store/resource/sheet/row";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("resourceSheetRowFooterSlot", () => {
  let wrapper: VueWrapper;
  const name = "name";

  afterEach(() => {
    wrapper?.unmount();
  });

  // The footer draws one cell per row-store header while the table itself is fed those headers minus
  // `data-table-select` plus showSelect, so a column on one side and not the other shifts every summary sideways
  test("renders one cell per row header, with the summary under its own column", async () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    column.footerStatisticsKey = "summation";
    wrapper = await mountSuspended(ResourceSheetRowFooterSlot);
    setupWithDataSource(createDataSource([column], [createRow({ [name]: 0 })]));
    const rowStore = useRowStore();
    await nextTick();
    const cells = wrapper.findAll("td");
    const columnIndex = rowStore.headers.findIndex(({ key }) => key === toColumnKey(name));

    expect(cells).toHaveLength(rowStore.headers.length);
    expect(takeOne(cells, columnIndex).text()).toBe("Sum 0");
  });
});
