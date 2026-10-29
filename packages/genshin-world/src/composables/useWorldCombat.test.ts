import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER, REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { STAMINA_MAX } from "genshin-engine";
import { assert, describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombat = (overrides: Partial<Parameters<typeof useWorldCombat>[0]> = {}) =>
  useWorldCombat({
    characterIdConstellationsMap: shallowRef(new Map()),
    enemyTables,
    events: createWorldEvents(),
    gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
    onPartyDown: () => {},
    onPartyRevived: () => {},
    partyBonusLines: shallowRef([]),
    placeWorldDrops: () => {},
    savedCharacters: [],
    savedParty: createParty([TRAVELER_CHARACTER_ID]),
    startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
    statTables,
    travelerBonusLines: shallowRef([]),
    travelerElement: shallowRef<Element>(),
    wildlifePlaces: [],
    ...overrides,
  });

describe(useWorldCombat, () => {
  test("a new player starts with the Traveler alone", () => {
    expect.hasAssertions();
    const { characters } = createCombat();

    expect(characters.value).toStrictEqual([createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap)]);
  });

  test("a chest opened in the world reaches the combat", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { kitContext } = createCombat({ events });
    events.emit("chestOpened");

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
    const { kitContext } = createCombat({
      savedCharacters: characterIds.map((characterId) => createCharacter(characterId, statTables.characterDataMap)),
      savedParty: createParty(characterIds),
      startingCharacterIdKitMap: new Map(characterIds.map((characterId) => [characterId, TRAVELER_KIT])),
      travelerElement: shallowRef(Element.Anemo),
    });
    const amount = 1;
    kitContext.stamina.spend(amount);

    expect(kitContext.stamina.value).toBe(STAMINA_MAX - amount * IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER);
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
    const { party, respawnParty, reviveFallenParty } = createCombat({ onPartyDown, onPartyRevived });
    getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare = 0;
    respawnParty();

    expect(onPartyDown).toHaveBeenCalledExactlyOnceWith();
    expect(onPartyRevived).not.toHaveBeenCalled();
    reviveFallenParty();

    expect(onPartyRevived).toHaveBeenCalledExactlyOnceWith();
    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare).toBe(REVIVE_HEALTH_SHARE);
  });
});
