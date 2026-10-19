import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { MARTIAL_ARTIST_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createMartialArtistSetModule } from "#src/services/artifact/sets/createMartialArtistSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createMartialArtistSetModule, () => {
  const wearer = createSetWearer(TRAVELER_KIT);

  test("prices its wearer at 15% more Normal and Charged Attack DMG from two pieces", () => {
    expect.hasAssertions();

    expect(
      createMartialArtistSetModule(
        getArtifactSetBonus(statTables, MARTIAL_ARTIST_ARTIFACT_SET_ID, 2),
      ).getPassiveBonuses?.(wearer, 1, [], []),
    ).toStrictEqual([
      { amount: 0.15, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.15, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
  });

  test("gives its wearer 25% more Normal and Charged Attack DMG for 8 seconds after its Elemental Skill from four pieces", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    createMartialArtistSetModule(getArtifactSetBonus(statTables, MARTIAL_ARTIST_ARTIFACT_SET_ID, 4)).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );
    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.25, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
      { amount: 0.25, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });
});
