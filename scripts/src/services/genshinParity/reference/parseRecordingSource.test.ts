import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { parseRecordingSource } from "#src/services/genshinParity/reference/parseRecordingSource";
import { describe, expect, test } from "vitest";

describe(parseRecordingSource, () => {
  test.each([
    [`${TEST_FILENAME}.mp4 at 0.5s`, { file: `${TEST_FILENAME}.mp4`, second: 0.5 }],
    [
      `${TEST_FILENAME}.mkv at 1s, cropped to 320x240 from 0,72`,
      { crop: { height: 240, width: 320, x: 0, y: 72 }, file: `${TEST_FILENAME}.mkv`, second: 1 },
    ],
  ])("reads %s", (source, expected) => {
    expect.hasAssertions();

    expect(parseRecordingSource(source)).toStrictEqual(expected);
  });

  test("throws on a source with no second", () => {
    expect.hasAssertions();

    expect(() => parseRecordingSource(TEST_FILENAME)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, not a recording source as \`<file> at <N>s\`]`,
    );
  });
});
