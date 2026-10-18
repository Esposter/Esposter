import { GCSIM_ODETTE_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(findQueuedAttack, () => {
  test("fires a loop iteration's variant of a copy's attack from the call of that iteration, and the copy from the others", () => {
    expect.hasAssertions();

    const name = "burst.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_ODETTE_FIXTURE_DIRECTORY, name), "utf8") }];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.line)).toStrictEqual([
      59, 56, 56, 66,
    ]);
  });

  test("fires an inline literal's attack from the call of the loop iteration it is in, its element that iteration's", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package varka",
          "",
          "var burstHitmark = []int{112, 131}",
          "",
          "func (c *char) burst() {",
          "\tele := []attributes.Element{attributes.Cryo, attributes.Anemo}",
          "\tfor i, hitmark := range burstHitmark {",
          "\t\tc.Core.QueueAttack(",
          "\t\t\tinfo.AttackInfo{AttackTag: attacks.AttackTagElementalBurst, Element: ele[i]},",
          "\t\t\tcombat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 6),",
          "\t\t\thitmark,",
          "\t\t\thitmark,",
          "\t\t)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.element)).toStrictEqual([
      "attributes.Cryo",
      "attributes.Anemo",
    ]);
  });
});
