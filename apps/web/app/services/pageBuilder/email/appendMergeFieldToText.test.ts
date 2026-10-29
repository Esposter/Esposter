import { toMergeField } from "@/services/emailEditor/toMergeField";
import { appendMergeFieldToText } from "@/services/pageBuilder/email/appendMergeFieldToText";
import { describe, expect, test } from "vitest";

describe(appendMergeFieldToText, () => {
  const COLUMN_NAME = "name";
  const WORDS = "a";

  test("a token after words is set off by a space", () => {
    expect.hasAssertions();

    expect(
      appendMergeFieldToText(
        { content: [{ content: [{ text: WORDS, type: "text" }], type: "paragraph" }], type: "doc" },
        COLUMN_NAME,
      ),
    ).toStrictEqual({
      content: [
        {
          content: [
            { text: WORDS, type: "text" },
            { text: ` ${toMergeField(COLUMN_NAME)}`, type: "text" },
          ],
          type: "paragraph",
        },
      ],
      type: "doc",
    });
  });

  test("a text with no paragraph gets one holding the token", () => {
    expect.hasAssertions();

    expect(appendMergeFieldToText({ type: "doc" }, COLUMN_NAME)).toStrictEqual({
      content: [{ content: [{ text: toMergeField(COLUMN_NAME), type: "text" }], type: "paragraph" }],
      type: "doc",
    });
  });
});
