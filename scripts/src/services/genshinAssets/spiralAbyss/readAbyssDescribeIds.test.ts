import { MONSTER_CODEX_TYPE } from "#src/services/genshinAssets/enemies/constants";
import { readAbyssDescribeIds } from "#src/services/genshinAssets/spiralAbyss/readAbyssDescribeIds";
import { describe, expect, test } from "vitest";

describe(readAbyssDescribeIds, () => {
  const ARCHIVED_DESCRIBE_ID = 1;
  const UNARCHIVED_DESCRIBE_ID = 2;
  const floors = [{ chambers: [{ halfMonsterDescribeIds: [[ARCHIVED_DESCRIBE_ID], [UNARCHIVED_DESCRIBE_ID]] }] }];
  const animalCodexRows = [{ describeId: ARCHIVED_DESCRIBE_ID, type: MONSTER_CODEX_TYPE }];

  test("a describe the archive does not list is left out, as its kind has no archive entry to publish with", () => {
    expect.hasAssertions();

    expect(readAbyssDescribeIds(floors, animalCodexRows)).toStrictEqual([ARCHIVED_DESCRIBE_ID]);
  });
});
