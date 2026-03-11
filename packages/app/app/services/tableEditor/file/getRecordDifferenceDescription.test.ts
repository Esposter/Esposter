import { getRecordDifferenceDescription } from "@/services/tableEditor/file/getRecordDifferenceDescription";
import { describe, expect, test } from "vitest";

describe(getRecordDifferenceDescription, () => {
  test("identical objects returns empty array", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, { "": "" })).toEqual([]);
  });

  test("changed string value produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, { "": " " })).toEqual([":  →  "]);
  });

  test("changed number value produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": 0 }, { "": 1 })).toEqual([": 0 → 1"]);
  });

  test("changed boolean value produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": true }, { "": false })).toEqual([": true → false"]);
  });

  test("changed date string value produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "1970-01-01" }, { "": "1970-01-02" })).toEqual([
      ": 1970-01-01 → 1970-01-02",
    ]);
  });

  test("null value produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": null }, { "": "" })).toEqual([": null → "]);
  });

  test("multiple changed values produces multiple diff entries", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 1 })).toEqual([
      ":  →  ",
      " : 0 → 1",
    ]);
  });

  test("unchanged keys are excluded from diff", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 0 })).toEqual([":  →  "]);
  });

  test("key only in updated produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({}, { "": "" })).toEqual([": undefined → "]);
  });

  test("key only in original produces diff entry", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, {})).toEqual([":  → undefined"]);
  });

  test("empty objects returns empty array", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({}, {})).toEqual([]);
  });
});
