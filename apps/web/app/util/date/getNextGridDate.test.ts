// @vitest-environment happy-dom
import { getNextGridDate } from "@/util/date/getNextGridDate";
import { describe, expect, test } from "vitest";

describe(getNextGridDate, () => {
  const date = Temporal.PlainDate.from({ day: 1, month: 1, year: 1970 });

  test("moves a day by an arrow", () => {
    expect.hasAssertions();

    expect(getNextGridDate(new KeyboardEvent("keydown", { key: "ArrowRight" }), date)).toStrictEqual(
      date.add({ days: 1 }),
    );
  });

  test("moves a year by Page Down with Shift", () => {
    expect.hasAssertions();

    expect(getNextGridDate(new KeyboardEvent("keydown", { key: "PageDown", shiftKey: true }), date)).toStrictEqual(
      date.add({ years: 1 }),
    );
  });

  test.each(["altKey", "ctrlKey", "metaKey"])("leaves an arrow held with %s to the browser", (modifier) => {
    expect.hasAssertions();

    expect(getNextGridDate(new KeyboardEvent("keydown", { key: "ArrowLeft", [modifier]: true }), date)).toBeUndefined();
  });
});
