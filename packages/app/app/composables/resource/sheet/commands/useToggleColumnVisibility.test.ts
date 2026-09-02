// @vitest-environment nuxt
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useToggleColumnVisibility, () => {
  setupCommandTest();

  test("hides a visible column", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    await toggleColumnVisibility(takeOne(dataSource.columns).id);

    expect(takeOne(dataSource.columns).isHidden).toBe(true);
  });

  test("shows a hidden column", async () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ isHidden: true, name: "" });
    const { dataSource } = setupWithDataSource(createDataSource([hiddenColumn], [createRow({ "": 0 })]));
    const toggleColumnVisibility = useToggleColumnVisibility();
    await toggleColumnVisibility(hiddenColumn.id);

    expect(takeOne(dataSource.columns).isHidden).toBe(false);
  });
});
