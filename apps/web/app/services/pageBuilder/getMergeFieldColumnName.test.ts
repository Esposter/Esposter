import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MERGE_FIELD_KIND_PREFIX } from "@/services/pageBuilder/constants";
import { getMergeFieldColumnName } from "@/services/pageBuilder/getMergeFieldColumnName";
import { describe, expect, test } from "vitest";

describe(getMergeFieldColumnName, () => {
  test("a kind carrying the merge field prefix names the column after it", () => {
    expect.hasAssertions();

    expect(getMergeFieldColumnName(`${MERGE_FIELD_KIND_PREFIX}first_name`)).toBe("first_name");
  });

  test("a block type's kind names no column", () => {
    expect.hasAssertions();

    expect(getMergeFieldColumnName(WebpageNodeType.Text)).toBeUndefined();
  });
});
