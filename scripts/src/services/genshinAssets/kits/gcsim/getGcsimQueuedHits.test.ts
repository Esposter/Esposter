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
      69, 66, 66, 76,
    ]);
  });
});
