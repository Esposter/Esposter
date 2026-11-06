import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitTaunt } from "#src/services/kit/effects/castKitTaunt";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER, REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { startTestWorldSession } from "#src/store/session.fixture";
import { STAMINA_MAX } from "genshin-engine";
import { assert, describe, expect, test, vi } from "vitest";
import { nextTick, shallowRef } from "vue";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombat = (
  overrides: Partial<Parameters<typeof useWorldCombat>[0]> = {},
  roster: Partial<Parameters<ReturnType<typeof useWorldPartyStore>["start"]>[0]> = {},
) => {
  startTestWorldSession({ gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL });
  const worldPartyStore = useWorldPartyStore();
  worldPartyStore.start({
    characterDataMap: statTables.characterDataMap,
    characterIdConstellationsMap: shallowRef(new Map()),
    savedCharacters: [],
    savedParty: createParty([TRAVELER_CHARACTER_ID]),
    startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
    ...roster,
  });
  const combat = useWorldCombat({
    enemyTables,
    onPartyDown: () => {},
    onPartyRevived: () => {},
    partyBonusLines: shallowRef([]),
    staminaMaximum: shallowRef(STAMINA_MAX),
    statTables,
    travelerBonusLines: shallowRef([]),
    travelerElement: shallowRef<Element>(),
    wildlifePlaces: [],
    ...overrides,
  });
  return { ...combat, worldPartyStore };
};

describe(useWorldCombat, () => {
  test("a new player starts with the Traveler alone", () => {
    expect.hasAssertions();
    const { worldPartyStore } = createCombat();

    expect(worldPartyStore.characters).toStrictEqual([
      createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap),
    ]);
  });

  test("a chest opened in the world reaches the combat", () => {
    expect.hasAssertions();
    const { kitContext } = createCombat();
    const worldSessionStore = useWorldSessionStore();
    worldSessionStore.events.emit("chestOpened");

    expect(kitContext.outbox).toStrictEqual([{ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.ChestOpened }]);
  });

  test("impetuous Winds cuts each spend from the stamina the party shares", () => {
    expect.hasAssertions();
    const characterIds = [
      TRAVELER_CHARACTER_ID,
      ...[...statTables.characterDataMap]
        .filter(([, { element }]) => element === Element.Anemo)
        .slice(0, 3)
        .map(([characterId]) => characterId),
    ];
    const { kitContext } = createCombat(
      { travelerElement: shallowRef(Element.Anemo) },
      {
        savedCharacters: characterIds.map((characterId) => createCharacter(characterId, statTables.characterDataMap)),
        savedParty: createParty(characterIds),
        startingCharacterIdKitMap: new Map(characterIds.map((characterId) => [characterId, TRAVELER_KIT])),
      },
    );
    const amount = 1;
    kitContext.stamina.spend(amount);

    expect(kitContext.stamina.value).toBe(STAMINA_MAX - amount * IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER);
  });

  test("a raised maximum reaches the pool, and a pool full at the old maximum stays full at the new one", async () => {
    expect.hasAssertions();
    // Mondstadt's levels 2 to 10 raise the maximum by 70 in all
    const STAMINA_RAISE = 70;
    const staminaMaximum = shallowRef(STAMINA_MAX);
    const { kitContext } = createCombat({ staminaMaximum });
    staminaMaximum.value = STAMINA_MAX + STAMINA_RAISE;
    await nextTick();

    expect([kitContext.stamina.maximum, kitContext.stamina.value]).toStrictEqual([
      STAMINA_MAX + STAMINA_RAISE,
      STAMINA_MAX + STAMINA_RAISE,
    ]);
  });

  test("a buff that raises Max HP shows on the HUD and lapses off it, with no party member written", () => {
    expect.hasAssertions();
    const { hudMember, kitContext } = createCombat();
    const unbuffedMaxHealth = hudMember.value?.maxHealth;
    assert(unbuffedMaxHealth !== undefined);
    const BUFF_AMOUNT = 1;
    buffKitMember(kitContext.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: BUFF_AMOUNT,
      attribute: Attribute.Health,
      secondsRemaining: 1,
    });

    expect(hudMember.value?.maxHealth).toStrictEqual(unbuffedMaxHealth + BUFF_AMOUNT);

    stepKitEffects(2, kitContext);

    expect(hudMember.value?.maxHealth).toStrictEqual(unbuffedMaxHealth);
  });

  test("game over offers revive at the nearest waypoint", () => {
    expect.hasAssertions();
    const onPartyDown = vi.fn<() => void>();
    const onPartyRevived = vi.fn<() => void>();
    const { respawnParty, reviveFallenParty, worldPartyStore } = createCombat({ onPartyDown, onPartyRevived });
    const { party } = worldPartyStore;
    getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare = 0;
    respawnParty();

    expect(onPartyDown).toHaveBeenCalledExactlyOnceWith();
    expect(onPartyRevived).not.toHaveBeenCalled();
    reviveFallenParty();

    expect(onPartyRevived).toHaveBeenCalledExactlyOnceWith();
    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare).toBe(REVIVE_HEALTH_SHARE);
  });

  test("an enemy's strike on a live taunt is priced with the buffs on the active character", () => {
    expect.hasAssertions();
    const TAUNT_HEALTH = 1_000_000;
    const TAUNT_SECONDS = 5;
    const DAMAGE_REDUCTION = 0.1;
    const { kitContext, strikeParty } = createCombat();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    castKitTaunt(kitContext.kitEffectState, kitContext.body, kitContext.activeCombatant, {
      health: TAUNT_HEALTH,
      secondsRemaining: TAUNT_SECONDS,
    });
    const taunt = kitContext.kitEffectState.effects.find((effect): effect is KitTaunt => effect.kind === "taunt");
    assert.exists(taunt);
    strikeParty(enemy, taunt);
    const unbuffedLoss = TAUNT_HEALTH - taunt.health;
    taunt.health = TAUNT_HEALTH;
    buffKitMember(kitContext.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: DAMAGE_REDUCTION,
      attribute: Attribute.DamageReduction,
      secondsRemaining: TAUNT_SECONDS,
    });
    strikeParty(enemy, taunt);

    expect(TAUNT_HEALTH - taunt.health).toBeLessThan(unbuffedLoss);
  });
});
