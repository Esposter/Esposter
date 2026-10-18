import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";
import type { StatTables } from "#src/models/character/StatTables";
import type { Element } from "#src/models/Element";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { HudMember } from "#src/models/hud/HudMember";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { Party } from "#src/models/party/Party";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { getPlayedTalentLevels } from "#src/services/character/getPlayedTalentLevels";
import { DATA_FETCH_RETRY_MS, WORLD_RANDOM_SEED } from "#src/services/constants";
import { getEnemyDroppedItems } from "#src/services/enemy/getEnemyDroppedItems";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { createCombatant } from "#src/services/kit/createCombatant";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { getSkillReadySeconds } from "#src/services/kit/getSkillReadySeconds";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { createWorldParty } from "#src/services/party/createWorldParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { chargePartyMember } from "#src/services/wildlife/chargePartyMember";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { getResultAsync, ID_SEPARATOR, InvalidOperationError, Operation } from "@esposter/shared";
import { useTimeoutFn } from "@vueuse/core";
import { createSeededRandom } from "genshin-engine";
import { computed, shallowRef, watch } from "vue";

// The party the player fields, the characters it is made of and their combat, and the world's combat state the kit on the
// Field steps in, with the enemies the world holds and the kit's effects on the team. A defeat places its drops and is a
// Doing the quests count, and a team that falls opens the game over screen, whose revive the host places
export const useWorldCombat = ({
  characterIdConstellationsMap,
  enemyTables,
  events,
  gameDataBaseUrl,
  onPartyDown,
  onPartyRevived,
  placeWorldDrops,
  savedCharacters,
  savedParty,
  startingCharacterIdKitMap,
  statTables,
  travelerBonusLines,
  travelerElement,
  wildlifePlaces,
}: {
  characterIdConstellationsMap: Readonly<Ref<ReadonlyMap<number, Constellation[]>>>;
  enemyTables: EnemyTables;
  events: WorldEvents;
  gameDataBaseUrl: string;
  onPartyDown: () => void;
  onPartyRevived: () => void;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  savedCharacters: Character[];
  savedParty: Party;
  startingCharacterIdKitMap: ReadonlyMap<number, Kit>;
  statTables: StatTables;
  // The bonuses the Traveler holds from the elements it resonated with, once Welkin Moon's Homecoming is done
  travelerBonusLines: Readonly<Ref<AttributeLine[]>>;
  // The element the Traveler holds, which the statue she resonated with last gives her, none until one is resonated with
  travelerElement: Readonly<Ref<Element | undefined>>;
  wildlifePlaces: readonly WildlifePlace[];
}) => {
  // The player's characters as the save holds them, the Traveler alone as a new player's, on the field, and their party
  const characters = shallowRef<Character[]>(
    savedCharacters.length > 0
      ? savedCharacters
      : [createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap)],
  );
  const party = createWorldParty(savedParty);
  // The deployed team's kits: the starting team's, built at the world's gate, and each character's built once as the team
  // Changes to take it in, its module and multipliers read on demand, playing each talent at the level it holds with what
  // Its constellations add
  const characterIdKitMap = shallowRef(startingCharacterIdKitMap);
  const deployedCharacterIds = computed(() => getDeployedCharacterIds(party));
  // A failed read is read again a wait later, as a team that does not change starts no other
  const { start: retryCharacterKits } = useTimeoutFn(() => readUnloadedCharacterKits(), DATA_FETCH_RETRY_MS, {
    immediate: false,
  });
  const readUnloadedCharacterKits = () => {
    const unloadedCharacters = characters.value.filter(
      ({ id }) => deployedCharacterIds.value.includes(id) && !characterIdKitMap.value.has(id),
    );
    if (unloadedCharacters.length === 0) return;
    const characterTalentLevelMap = new Map(
      unloadedCharacters.map(
        (character) =>
          [
            character.id,
            getPlayedTalentLevels(character, characterIdConstellationsMap.value.get(character.id) ?? []),
          ] as const,
      ),
    );
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readCharacterKits(gameDataBaseUrl, characterTalentLevelMap)).match(
      (newCharacterIdKitMap) => {
        // A kit already built is kept over one a read overlapping it built again, since a kit in play holds its state
        characterIdKitMap.value = new Map([...newCharacterIdKitMap, ...characterIdKitMap.value]);
      },
      (error) => {
        console.error(error);
        retryCharacterKits();
      },
    );
  };
  watch(deployedCharacterIds, readUnloadedCharacterKits);
  // How the character on the field moves, its body type's
  const locomotion = computed(() => getCharacterLocomotion(getActiveCharacterId(party), statTables.characterDataMap));
  // Each character's combat once its kit is built, a character whose kit has not arrived having none yet. The character on
  // The field's combat and its party member are what the HUD's Health and skills read
  const characterIdCombatantMap = computed(() => {
    const combatantMap = new Map<number, Combatant>();
    // The deployed team's resonances, read off its members' elements in the roster, which hold on every member
    const { characterDataMap } = statTables;
    const getElement = (characterId: number) =>
      characterId === TRAVELER_CHARACTER_ID ? travelerElement.value : characterDataMap.get(characterId)?.element;
    const elementalResonances = getElementalResonances(
      deployedCharacterIds.value.flatMap((characterId) => {
        const element = getElement(characterId);
        return element ? [element] : [];
      }),
    );
    for (const character of characters.value.filter(({ id }) => deployedCharacterIds.value.includes(id))) {
      const kit = characterIdKitMap.value.get(character.id);
      if (kit)
        combatantMap.set(
          character.id,
          createCombatant(
            character,
            kit,
            elementalResonances,
            statTables,
            getElement(character.id),
            travelerBonusLines.value,
          ),
        );
    }
    return combatantMap;
  });
  const activeCombatant = computed(() => characterIdCombatantMap.value.get(getActiveCharacterId(party)));
  const activePartyMember = computed(() => getPartyMember(party, getActiveCharacterId(party)));
  // The field member's figures the HUD's health and skill buttons show, none until the character on the field is known.
  // A skill with charges counts down only while none of them stands
  const hudMember = computed<HudMember | undefined>(() => {
    const combatant = activeCombatant.value;
    if (!combatant) return undefined;
    const partyMember = activePartyMember.value;
    return {
      burstCooldown: partyMember.burstCooldownSeconds,
      burstCooldownSeconds: combatant.kit.burstCooldownSeconds,
      characterId: getActiveCharacterId(party),
      element: combatant.element,
      energy: partyMember.energy,
      energyCost: combatant.kit.burstEnergyCost,
      health: partyMember.healthShare * combatant.attributes.maxHealth,
      level: combatant.level,
      maxHealth: combatant.attributes.maxHealth,
      skillCooldown: getSkillReadySeconds(
        combatant.kit,
        combatant.elementalResonances,
        partyMember.skillCooldownSeconds,
      ),
      skillCooldownSeconds: combatant.kit.skillCooldownSeconds,
      weaponType: combatant.weaponType,
    };
  });
  // The deployed team's skill and burst icons the HUD's buttons carry, by character id, each carried by its kit
  const characterIdSkillGlyphsMap = computed(
    () =>
      new Map(
        [...characterIdKitMap.value].flatMap(([characterId, { skillGlyphs }]) =>
          skillGlyphs ? [[characterId, skillGlyphs] as const] : [],
        ),
      ),
  );
  const startingCombatant = activeCombatant.value;
  if (!startingCombatant)
    throw new InvalidOperationError(Operation.Read, useWorldCombat.name, `${getActiveCharacterId(party)}`);
  // The world's combat state, which the character on the field steps into: it starts with the active character standing at
  // The origin, its enemies are written in as their Camps load and as they die, and its random source is the world's one
  // Seeded source, so a session's rolls repeat
  const kitContext: KitContext = {
    activeCombatant: startingCombatant,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    get characterIdCombatantMap() {
      return characterIdCombatantMap.value;
    },
    enemyMap: new Map<string, Enemy>(),
    enemyTables,
    expiredEffects: [],
    kitEffectState: { effects: [] },
    oreStrikes: [],
    outbox: [],
    party,
    placeWildlifeDrops: (wildlife, droppedItems) =>
      placeWorldDrops({ id: wildlife.id, position: wildlife.position }, droppedItems),
    random: createSeededRandom(WORLD_RANDOM_SEED),
    strikes: [],
    wildlifeList: wildlifePlaces.map((wildlifePlace) => createWildlife(wildlifePlace)),
  };
  // Mora the character on the field picks up is an event of combat for the next step, which an artifact set answers
  events.on("pickUpMora", () => {
    kitContext.outbox.push({ characterId: getActiveCharacterId(party), kind: KitEventKind.MoraPickedUp });
  });
  // A chest opened in the world is an event of combat for the next step too, which an artifact set answers
  events.on("chestOpened", () => {
    kitContext.outbox.push({ characterId: getActiveCharacterId(party), kind: KitEventKind.ChestOpened });
  });
  const clearKitEffects = () => {
    kitContext.kitEffectState.effects = [];
  };
  // A defeated enemy's drops lie where it fell, numbered on from the drops placed before them, and the defeat is a doing
  // The quests in progress count
  const defeatEnemy = (enemy: Enemy, enemyDrops: EnemyDrops) => {
    placeWorldDrops(
      { id: [enemy.campId, enemy.id].join(ID_SEPARATOR), position: enemy.position },
      getEnemyDroppedItems(enemyDrops),
    );
    events.emit("defeatEnemy", enemy);
    events.emit("achievementEvents", [
      { kind: AchievementEventKind.MonsterDefeated, quantity: 1, targetId: String(enemy.enemyKindId) },
    ]);
    events.emit("questEvent", { kind: QuestObjectiveKind.Defeat, targetId: String(enemy.enemyKindId) });
  };
  // A team that has all fallen opens the game over screen, which offers its revive
  const respawnParty = () => {
    if (checkIsPartyDown(party)) onPartyDown();
  };
  // The game over screen's revive: the team comes back at the share the game brings it back with, and is jumped to where
  // The host places it
  const reviveFallenParty = () => {
    reviveParty(party);
    onPartyRevived();
  };
  // An enemy's strike lands on the taunt it struck, or on the character on the field through the team's shields, and a team
  // It fells respawns
  const strikeParty = (enemy: Enemy, taunt?: KitTaunt) => {
    const combatant = activeCombatant.value;
    if (!combatant) return;
    if (taunt) {
      damageKitTaunt(kitContext.outbox, taunt, computeEnemyStrikeDamage(enemyTables, enemy, combatant));
      return;
    }

    kitContext.outbox.push(...strikePartyMember(enemyTables, party, enemy, combatant, kitContext.kitEffectState));
    respawnParty();
  };
  // A boar's charge lands on the character on the field through the team's shields, and a team it fells respawns
  const chargeParty = () => {
    const combatant = activeCombatant.value;
    if (!combatant) return;
    chargePartyMember(party, combatant, kitContext.kitEffectState);
    respawnParty();
  };
  return {
    characterIdSkillGlyphsMap,
    characters,
    chargeParty,
    clearKitEffects,
    defeatEnemy,
    hudMember,
    kitContext,
    locomotion,
    party,
    respawnParty,
    reviveFallenParty,
    strikeParty,
  };
};
