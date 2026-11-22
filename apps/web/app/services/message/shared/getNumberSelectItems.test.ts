import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getNumberSelectItems } from "#src/services/message/shared/getNumberSelectItems";
import { describe, expect, test } from "vitest";

describe(getNumberSelectItems, () => {
  test("offers each option under its title and as the string of its number", () => {
    expect.hasAssertions();

    expect(getNumberSelectItems([{ title: "title", value: 0 }], UiIconMeaning.Timer)).toStrictEqual([
      { meaning: UiIconMeaning.Timer, title: "title", value: "0" },
    ]);
  });
});
