// @vitest-environment nuxt
import { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import ResourceSheetRowDeduplicateDialog from "#src/components/Resource/Sheet/Row/DeduplicateDialog.vue";
import { createBooleanColumn } from "#src/composables/resource/sheet/commands/createBooleanColumn.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSheetRowDeduplicateDialog", () => {
  const name = "name";

  // The preview names the rows that will go as the grid draws them, so a boolean column reads Yes here where the grid
  // Reads Yes, not the stored true
  test("previews each duplicate's cells in their column's format", async () => {
    expect.hasAssertions();

    const column = createBooleanColumn(name);
    column.format = BooleanFormat.YesNo;
    setupWithDataSource(createDataSource([column], [createRow({ [name]: true }), createRow({ [name]: true })]));
    const wrapper = await mountSuspended(ResourceSheetRowDeduplicateDialog, { props: { modelValue: true } });

    expect(wrapper.findAll("td").map((cell) => cell.text())).toContain("Yes");
  });
});
