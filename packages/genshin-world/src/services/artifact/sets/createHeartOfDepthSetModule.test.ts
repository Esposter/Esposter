import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { HEART_OF_DEPTH_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createHeartOfDepthSetModule } from "#src/services/artifact/sets/createHeartOfDepthSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createHeartOfDepthSetModule, () => {
  const wearer = createSetWearer(TRAVELER_KIT);

  test("gives its wearer 30% more Normal and Charged Attack DMG for 15 seconds after its Elemental Skill from four pieces", () => {
    expect.hasAssertions();

    const bonus = statTables.artifactSetDataMap
      .get(HEART_OF_DEPTH_ARTIFACT_SET_ID)
      ?.bonuses.find((b) => b.pieceCount === 4);
    assert.exists(bonus);
    const kitEffectState: KitEffectState = { effects: [] };
    createHeartOfDepthSetModule(bonus).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );
    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.3, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 15 },
      { amount: 0.3, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 15 },
    ]);
  });
});
