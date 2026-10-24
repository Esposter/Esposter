import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getNumberSelectItems } from "@/services/message/shared/getNumberSelectItems";
import { describe, expect, test } from "vitest";

describe(getNumberSelectItems, () => {
  test("offers each option under its title and as the string of its number", () => {
    expect.hasAssertions();

    expect(getNumberSelectItems([{ title: "1 minute", value: 60 }], UiIconMeaning.Timer)).toStrictEqual([
      { meaning: UiIconMeaning.Timer, title: "1 minute", value: "60" },
    ]);
  });
});
