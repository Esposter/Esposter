import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { GAMBLER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createGamblerSetModule } from "#src/services/artifact/sets/createGamblerSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createGamblerSetModule, () => {
  const wearer = createSetWearer(KIT);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  test("raises the DMG of its wearer's Elemental Skills by 20% from two pieces, and of no other strike", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createGamblerSetModule(
      getArtifactSetBonus(statTables, GAMBLER_ARTIFACT_SET_ID, 2),
    );

    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, party, [])).toBeCloseTo(
      0.2,
    );
    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });

  test("ends its wearer's skill cooldown when it defeats an opponent from four pieces, once every 15 seconds", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { onKitEvent } = createGamblerSetModule(getArtifactSetBonus(statTables, GAMBLER_ARTIFACT_SET_ID, 4));
    const defeat = { enemy, kind: KitEventKind.EnemyDefeated, striker: wearer } as const;
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);

    partyMember.skillCooldownSeconds = 5;
    onKitEvent?.(defeat, context, wearer);
    expect(partyMember.skillCooldownSeconds).toBe(0);

    partyMember.skillCooldownSeconds = 5;
    onKitEvent?.(defeat, context, wearer);
    expect(partyMember.skillCooldownSeconds).toBe(5);

    stepKitSeconds(context, 14.5);
    partyMember.skillCooldownSeconds = 5;
    onKitEvent?.(defeat, context, wearer);
    expect(partyMember.skillCooldownSeconds).toBe(5);

    stepKitSeconds(context, 1);
    partyMember.skillCooldownSeconds = 5;
    onKitEvent?.(defeat, context, wearer);
    expect(partyMember.skillCooldownSeconds).toBe(0);
  });

  test("ends no skill cooldown when a defeat has no striker", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { onKitEvent } = createGamblerSetModule(getArtifactSetBonus(statTables, GAMBLER_ARTIFACT_SET_ID, 4));
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);

    partyMember.skillCooldownSeconds = 5;
    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: undefined }, context, wearer);
    expect(partyMember.skillCooldownSeconds).toBe(5);
  });
});
