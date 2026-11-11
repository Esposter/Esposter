import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMenuItemByValue } from "@/services/ui/getMenuItemByValue";
import { describe, expect, test } from "vitest";

describe(getMenuItemByValue, () => {
  const importCsv: Item = { icon: "i-test:csv", title: "Csv" };
  const exportCsv: Item = { icon: "i-test:csv", title: "Csv" };
  const copy: Item = { meaning: UiIconMeaning.Copy, title: "Copy" };
  const items: Item[] = [
    { children: [importCsv], meaning: UiIconMeaning.Upload, title: "Import" },
    { children: [exportCsv], meaning: UiIconMeaning.Download, title: "Export" },
    copy,
  ];

  test("finds a top-level item by its title", () => {
    expect.hasAssertions();

    expect(getMenuItemByValue(items, "Copy")).toBe(copy);
  });

  test("finds a child by its group and its own title, so one title under two groups is two items", () => {
    expect.hasAssertions();

    expect(getMenuItemByValue(items, "Import/Csv")).toBe(importCsv);
    expect(getMenuItemByValue(items, "Export/Csv")).toBe(exportCsv);
  });

  test("finds nothing for a value no item has", () => {
    expect.hasAssertions();

    expect(getMenuItemByValue(items, "Csv")).toBeUndefined();
  });
});
