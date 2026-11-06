import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { getDropRefusal } from "@/services/pageBuilder/getDropRefusal";
import { describe, expect, test } from "vitest";

describe(getDropRefusal, () => {
  test("a block no slot takes under the pointer is refused by its title", () => {
    expect.hasAssertions();

    expect(getDropRefusal(WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Column])).toBe("A Column can't go here");
  });

  test("a block with no title has no refusal to show", () => {
    expect.hasAssertions();

    expect(getDropRefusal(undefined)).toBe("");
  });
});
