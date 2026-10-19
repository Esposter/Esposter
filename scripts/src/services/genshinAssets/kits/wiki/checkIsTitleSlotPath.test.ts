import { checkIsTitleSlotPath } from "#src/services/genshinAssets/kits/wiki/checkIsTitleSlotPath";
import { getSlotPath } from "#src/services/genshinAssets/kits/wiki/getSlotPath";
import { assert, describe, expect, test } from "vitest";

describe(checkIsTitleSlotPath, () => {
  test.each<[string, boolean]>([
    ["normalAttacks.0.hits.0", true],
    ["chargedAttack.hits.0", true],
    ["plunges.high.hits.0", true],
    ["plungeCollision", true],
    ["skillChain.followUps.0.hits.0", false],
    ["plungeVariants.0.hits.0", false],
    ["actions.kesagiris.0.hits.0", false],
    ["hitFields.lightningDischarge", false],
  ])("checks whether %s is a title slot path, which is %s", (path, expected) => {
    expect.hasAssertions();

    expect(checkIsTitleSlotPath(path)).toStrictEqual(expected);
  });

  test.each([
    "Normal Attack 1-Hit",
    "Normal Attack 2-Hit B",
    "Charged Attack",
    "High Plunge",
    "Low Plunge",
    "Plunging Attack Collision",
  ])("accepts the path getSlotPath gives the title %s", (title) => {
    expect.hasAssertions();

    const path = getSlotPath(title);
    assert.exists(path);
    expect(checkIsTitleSlotPath(path)).toStrictEqual(true);
  });
});
