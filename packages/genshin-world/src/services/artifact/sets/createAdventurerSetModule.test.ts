import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ADVENTURER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createAdventurerSetModule } from "#src/services/artifact/sets/createAdventurerSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// The given seconds stepped through the team's effects at the world's fixed step
const stepSeconds = (context: KitContext, seconds: number) => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++)
    stepKitEffects(FIXED_STEP_SECONDS, context);
};

describe(createAdventurerSetModule, () => {
  const adventurerSetData = statTables.artifactSetDataMap.get(ADVENTURER_ARTIFACT_SET_ID);
  assert.exists(adventurerSetData);
  const adventurerSetModule = createAdventurerSetModule(takeOne(adventurerSetData.bonuses, 1));
  const PARTY_CHARACTER_IDS = [1, 2];
  const wearer: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 3000 }]),
    characterId: takeOne(PARTY_CHARACTER_IDS, 0),
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("a chest opened by a four-piece wearer restores HP for five seconds", () => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    getPartyMember(party, wearer.characterId).healthShare = 0.5;
    const context = createKitTestContext(wearer, { party });
    adventurerSetModule.onKitEvent?.(
      { characterId: wearer.characterId, kind: KitEventKind.ChestOpened },
      context,
      wearer,
    );
    stepSeconds(context, 5);

    expect(getPartyMember(party, wearer.characterId).healthShare).toBeCloseTo(0.8);
  });

  test("the restoration stops after five seconds", () => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    getPartyMember(party, wearer.characterId).healthShare = 0.5;
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    adventurerSetModule.onKitEvent?.(
      { characterId: wearer.characterId, kind: KitEventKind.ChestOpened },
      context,
      wearer,
    );
    stepSeconds(context, 6);

    expect(getPartyMember(party, wearer.characterId).healthShare).toBeCloseTo(0.8);
    expect(kitEffectState.effects).toStrictEqual([]);
  });
  test("a chest opened during the restoration restarts it", () => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    getPartyMember(party, wearer.characterId).healthShare = 0.1;
    const context = createKitTestContext(wearer, { party });
    const openChest = () =>
      adventurerSetModule.onKitEvent?.(
        { characterId: wearer.characterId, kind: KitEventKind.ChestOpened },
        context,
        wearer,
      );
    openChest();
    stepSeconds(context, 2);
    openChest();
    stepSeconds(context, 6);

    expect(getPartyMember(party, wearer.characterId).healthShare).toBeCloseTo(0.52);
  });
});
