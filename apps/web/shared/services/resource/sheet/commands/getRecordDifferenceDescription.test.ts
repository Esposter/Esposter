import { RECORD_DIFFERENCE_HEADER } from "#shared/services/resource/sheet/commands/constants";
import { getRecordDifferenceDescription } from "#shared/services/resource/sheet/commands/getRecordDifferenceDescription";
import { describe, expect, test } from "vitest";

describe(getRecordDifferenceDescription, () => {
  test("identical objects returns empty string", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, { "": "" })).toBe("");
  });

  test("multiple changed values produces multiple rows", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 1 })).toBe(
      `${RECORD_DIFFERENCE_HEADER}\n |  |  \n  | 0 | 1`,
    );
  });

  test("unchanged keys are excluded", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "", " ": 0 }, { "": " ", " ": 0 })).toBe(
      `${RECORD_DIFFERENCE_HEADER}\n |  |  `,
    );
  });

  test("key only in updated produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({}, { "": "" })).toBe(`${RECORD_DIFFERENCE_HEADER}\n | undefined | `);
  });

  test("key only in original produces table", () => {
    expect.hasAssertions();

    expect(getRecordDifferenceDescription({ "": "" }, {})).toBe(`${RECORD_DIFFERENCE_HEADER}\n |  | undefined`);
  });
});
