import { dayjs } from "#shared/services/dayjs";
import { getRecordDifferenceDescription } from "@/services/resource/sheet/commands/getRecordDifferenceDescription";
import { describe, expect, test } from "vitest";

describe(getRecordDifferenceDescription, () => {
  const HEADER = "key | original | updated\n:---: | :---: | :---:";

  test("identical objects returns empty string", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, { "": "" })).toBe("");
  });

  test("changed string value produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, { "": " " })).toBe(`${HEADER}\n |  |  `);
  });

  test("changed date value produces table", () => {
    expect.hasAssertions();

    const originalValue = dayjs("1970-01-01", "YYYY-MM-DD", true).toDate();
    const updatedValue = dayjs("1970-01-02", "YYYY-MM-DD", true).toDate();

    expect(getRecordDifferenceDescription({ "": originalValue }, { "": updatedValue })).toBe(
      `${HEADER}\n | 1970-01-01 | 1970-01-02`,
    );
  });

  test("multiple changed values produces multiple rows", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 1 })).toBe(
      `${HEADER}\n |  |  \n  | 0 | 1`,
    );
  });

  test("unchanged keys are excluded", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 0 })).toBe(`${HEADER}\n |  |  `);
  });

  test("key only in updated produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({}, { "": "" })).toBe(`${HEADER}\n | undefined | `);
  });

  test("key only in original produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, {})).toBe(`${HEADER}\n |  | undefined`);
  });
});
