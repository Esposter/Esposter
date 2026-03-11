import { getRecordDifferenceDescription } from "@/services/tableEditor/file/getRecordDifferenceDescription";
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

  test("changed number value produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": 0 }, { "": 1 })).toBe(`${HEADER}\n | 0 | 1`);
  });

  test("changed boolean value produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": true }, { "": false })).toBe(`${HEADER}\n | true | false`);
  });

  test("changed date string value produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "1970-01-01" }, { "": "1970-01-02" })).toBe(
      `${HEADER}\n | 1970-01-01 | 1970-01-02`,
    );
  });

  test("null value produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": null }, { "": "" })).toBe(`${HEADER}\n | null | `);
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

  test("empty objects returns empty string", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({}, {})).toBe("");
  });
});
