// @vitest-environment nuxt
import ResourceSheetEditDialogButton from "@/components/Resource/Sheet/EditDialog/Button.vue";
import ResourceSheetRowCreateDialogButton from "@/components/Resource/Sheet/Row/CreateDialogButton.vue";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createUpdatedColumn } from "@/composables/resource/sheet/commands/createUpdatedColumn.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceSheetRowCreateDialogButton", () => {
  // The dialog stays mounted with the blade, so a row it makes after a column was renamed has to be keyed by the
  // Name the sheet has now — keyed by the one it had at mount, the new row's cell sits under no column at all
  test("keys the row it creates by the columns the sheet has when it is made", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(createDataSource([createColumn("")], []));
    const wrapper = await mountSuspended(ResourceSheetRowCreateDialogButton);
    const updateColumn = useUpdateColumn();
    await updateColumn("", createUpdatedColumn(takeOne(dataSource.columns), { name: " " }));
    await nextTick();
    const editDialogButton = wrapper.findComponent(ResourceSheetEditDialogButton);
    editDialogButton.vm.$emit("submit", () => {});
    await flushPromises();

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ " ": null }]);
  });
});
