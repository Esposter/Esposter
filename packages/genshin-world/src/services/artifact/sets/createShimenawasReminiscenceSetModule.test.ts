import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createShimenawasReminiscenceSetModule } from "#src/services/artifact/sets/createShimenawasReminiscenceSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createShimenawasReminiscenceSetModule, () => {
  const wearer = createKitCombatant(TRAVELER_CHARACTER_ID, KIT);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  test("spends 15 Energy on casting an Elemental Skill and raises the DMG of its wearer's Normal, Charged and Plunging Attacks by 50% for 10 seconds", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getStrikeDamageBonus, onKitEvent } = createShimenawasReminiscenceSetModule(
      getArtifactSetBonus(statTables, SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID, 4),
    );
    partyMember.energy = 15;

    onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wearer);

    expect(partyMember.energy).toBe(0);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.NormalAttack), enemy, party, kitEffectState.effects),
    ).toBe(0.5);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ChargedAttack), enemy, party, kitEffectState.effects),
    ).toBe(0.5);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.PlungingAttack), enemy, party, kitEffectState.effects),
    ).toBe(0.5);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, party, kitEffectState.effects),
    ).toBe(0);
  });

  test("starts nothing and spends nothing on a skill cast with less than 15 Energy", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getStrikeDamageBonus, onKitEvent } = createShimenawasReminiscenceSetModule(
      getArtifactSetBonus(statTables, SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID, 4),
    );
    partyMember.energy = 14;

    onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wearer);

    expect(partyMember.energy).toBe(14);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.NormalAttack), enemy, party, kitEffectState.effects),
    ).toBe(0);
  });

  test("does not trigger again while its 10 seconds run", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { onKitEvent } = createShimenawasReminiscenceSetModule(
      getArtifactSetBonus(statTables, SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID, 4),
    );
    const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed } as const;

    partyMember.energy = 15;
    onKitEvent?.(skillUsed, context, wearer);
    partyMember.energy = 15;
    onKitEvent?.(skillUsed, context, wearer);

    expect(partyMember.energy).toBe(15);
  });
});
