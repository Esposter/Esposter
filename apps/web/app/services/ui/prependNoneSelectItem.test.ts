import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prependNoneSelectItem } from "@/services/ui/prependNoneSelectItem";
import { describe, expect, test } from "vitest";

describe(prependNoneSelectItem, () => {
  test("a select with no items offers only none", () => {
    expect.hasAssertions();

    expect(prependNoneSelectItem([])).toStrictEqual([{ meaning: UiIconMeaning.None, title: "None", value: "" }]);
  });

  test("none leads, ahead of the items in the order they were given", () => {
    expect.hasAssertions();

    const items: UiSelectItem<string>[] = [
      { meaning: UiIconMeaning.Columns, title: "Name", value: "name" },
      { meaning: UiIconMeaning.Columns, title: "Age", value: "age" },
    ];

    expect(prependNoneSelectItem(items).map(({ title }) => title)).toStrictEqual(["None", "Name", "Age"]);
  });

  test("the empty choice takes the title its select gives it", () => {
    expect.hasAssertions();

    expect(prependNoneSelectItem([], "Never")).toStrictEqual([
      { meaning: UiIconMeaning.None, title: "Never", value: "" },
    ]);
  });
});
