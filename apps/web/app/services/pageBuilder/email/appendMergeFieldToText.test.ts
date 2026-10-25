import { toMergeField } from "@/services/emailEditor/toMergeField";
import { appendMergeFieldToText } from "@/services/pageBuilder/email/appendMergeFieldToText";
import { describe, expect, test } from "vitest";

describe(appendMergeFieldToText, () => {
  const COLUMN_NAME = "name";

  test("a text with no paragraph gets one holding the token", () => {
    expect.hasAssertions();

    expect(appendMergeFieldToText({ type: "doc" }, COLUMN_NAME)).toStrictEqual({
      content: [{ content: [{ text: toMergeField(COLUMN_NAME), type: "text" }], type: "paragraph" }],
      type: "doc",
    });
  });
});
