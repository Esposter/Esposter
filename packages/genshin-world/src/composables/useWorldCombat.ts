import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { StatTables } from "#src/models/character/StatTables";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { HudMember } from "#src/models/hud/HudMember";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";
import type { Ref } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getCharacterElement } from "#src/services/character/getCharacterElement";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { getEnemyDroppedItems } from "#src/services/enemy/getEnemyDroppedItems";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { createCombatant } from "#src/services/kit/createCombatant";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { getSkillReadySeconds } from "#src/services/kit/getSkillReadySeconds";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { getDeployedElements } from "#src/services/party/getDeployedElements";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { getImpetuousWindsStaminaConsumptionMultiplier } from "#src/services/party/getImpetuousWindsStaminaConsumptionMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { chargePartyMember } from "#src/services/wildlife/chargePartyMember";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldPickupsStore } from "#src/store/pickups";
import { useWorldSessionStore } from "#src/store/session";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createSeededRandom, createStamina, LocomotionState } from "genshin-engine";
import { storeToRefs } from "pinia";
import { computed, shallowReactive, watch } from "vue";

// The combat of the party the player fields, and the world's combat state the kit on the
// Field steps in, with the enemies the world holds and the kit's effects on the team. A defeat places its drops and is a
// Doing the quests count, and a team that falls opens the game over screen, whose revive the host places
export const useWorldCombat = ({
  enemyTables,
  onPartyDown,
  onPartyRevived,
  partyBonusLines,
  staminaMaximum,
  statTables,
  travelerBonusLines,
  travelerElement,
  wildlifePlaces,
}: {
  enemyTables: EnemyTables;
  onPartyDown: () => void;
  onPartyRevived: () => void;
  // The bonuses the whole party holds from the Spiral Abyss's chamber, which every character of the party takes
  partyBonusLines: Readonly<Ref<AttributeLine[]>>;
  // The most the party's stamina holds, which the statues raise as their levels are reached
  staminaMaximum: Readonly<Ref<number>>;
  statTables: StatTables;
  // The bonuses the Traveler holds from the elements it resonated with, once Welkin Moon's Homecoming is done
  travelerBonusLines: Readonly<Ref<AttributeLine[]>>;
  // The element the Traveler holds, which the statue she resonated with last gives her, none until one is resonated with
  travelerElement: Readonly<Ref<Element | undefined>>;
  wildlifePlaces: readonly WildlifePlace[];
}) => {
  const worldPickupsStore = useWorldPickupsStore();
  const { placeWorldDrops } = worldPickupsStore;
  const worldSessionStore = useWorldSessionStore();
  const { events } = worldSessionStore;
  const worldPartyStore = useWorldPartyStore();
  const { activeCharacterId, characterIdKitMap, characters, deployedCharacterIds } = storeToRefs(worldPartyStore);
  const { party } = worldPartyStore;
  // How the character on the field moves, its body type's
  const locomotion = computed(() => getCharacterLocomotion(activeCharacterId.value, statTables.characterDataMap));
  // Each character's combat once its kit is built, a character whose kit has not arrived having none yet. The character on
  // The field's combat and its party member are what the HUD's Health and skills read
  const characterIdCombatantMap = computed(() => {
    const combatantMap = new Map<number, Combatant>();
    // The deployed team's elements, read off its members' records and the Traveler's element, which the resonances and each
    // Member's combat read, and the resonances hold on every member
    const { characterDataMap } = statTables;
    const deployedElements = getDeployedElements(deployedCharacterIds.value, characterDataMap, travelerElement.value);
    const elementalResonances = getElementalResonances(
      deployedElements.flatMap((element) => (element ? [element] : [])),
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
            getCharacterElement(character.id, characterDataMap, travelerElement.value),
            travelerBonusLines.value,
            partyBonusLines.value,
            deployedElements,
          ),
        );
    }
    return combatantMap;
  });
  const activeCombatant = computed(() => characterIdCombatantMap.value.get(activeCharacterId.value));
  const activePartyMember = computed(() => getPartyMember(party, activeCharacterId.value));
  const startingCombatant = activeCombatant.value;
  if (!startingCombatant)
    throw new InvalidOperationError(Operation.Read, useWorldCombat.name, `${activeCharacterId.value}`);
  // The party's stamina pool, which the character on the field spends from and the kit restores to, held across swaps.
  // Impetuous Winds cuts every spend from it, the body's and the kit's, read from the field's resonances at each spend
  const stamina = createStamina(staminaMaximum.value, () =>
    getImpetuousWindsStaminaConsumptionMultiplier(activeCombatant.value?.elementalResonances ?? []),
  );
  // A level reached raises the pool's maximum, and a pool full at the old maximum stays full at the new one
  watch(staminaMaximum, (maximum) => {
    const isFull = stamina.value >= stamina.maximum;
    stamina.maximum = maximum;
    if (isFull) stamina.refill();
  });
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
    isSkillHeld: false,
    // Reactive as a shallow object, so the HUD's Max HP follows the team's effects as they start and lapse
    kitEffectState: shallowReactive<KitEffectState>({ effects: [] }),
    locomotionState: LocomotionState.Idle,
    oreStrikes: [],
    outbox: [],
    party,
    placeWildlifeDrops: (wildlife, droppedItems) => {
      placeWorldDrops({ id: wildlife.id, position: wildlife.position }, droppedItems);
    },
    random: createSeededRandom(WORLD_RANDOM_SEED),
    reactionTriggers: [],
    stamina,
    strikes: [],
    wildlifeList: wildlifePlaces.map((wildlifePlace) => createWildlife(wildlifePlace)),
  };
  // The field member's figures the HUD's health and skill buttons show, none until the character on the field is known.
  // A skill with charges counts down only while none of them stands
  const hudMember = computed<HudMember | undefined>(() => {
    const combatant = activeCombatant.value;
    if (!combatant) return undefined;
    const partyMember = activePartyMember.value;
    const maxHealth = getKitMaxHealth(
      combatant,
      kitContext.kitEffectState.effects,
      party,
      kitContext.characterIdCombatantMap,
    );
    return {
      burstCooldown: partyMember.burstCooldownSeconds,
      burstCooldownSeconds: combatant.kit.burstCooldownSeconds,
      characterId: activeCharacterId.value,
      element: combatant.element,
      energy: partyMember.energy,
      energyCost: combatant.kit.burstEnergyCost,
      health: partyMember.healthShare * maxHealth,
      level: combatant.level,
      maxHealth,
      skillCooldown: getSkillReadySeconds(combatant.kit, combatant, partyMember.skillCooldownSeconds),
      skillCooldownSeconds: combatant.kit.skillCooldownSeconds,
      weaponType: combatant.weaponType,
    };
  });
  // Mora the character on the field picks up is an event of combat for the next step, which an artifact set answers
  events.on("pickUpMora", () => {
    kitContext.outbox.push({ characterId: activeCharacterId.value, kind: KitEventKind.MoraPickedUp });
  });
  // A chest opened in the world is an event of combat for the next step too, which an artifact set answers
  events.on("chestOpened", () => {
    kitContext.outbox.push({ characterId: activeCharacterId.value, kind: KitEventKind.ChestOpened });
  });
  const clearKitEffects = () => {
    kitContext.kitEffectState.effects = [];
  };
  // A defeated enemy's drops lie where it fell, numbered on from the drops placed before them, and the defeat is a doing
  // The quests in progress count
  const defeatEnemy = (enemy: Enemy, enemyDrops: EnemyDrops) => {
    placeWorldDrops(
      { id: getSpawnKey(enemy.campId, enemy.id), position: enemy.position },
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
      damageKitTaunt(
        kitContext.outbox,
        taunt,
        computeEnemyStrikeDamage(
          enemyTables,
          enemy,
          getBuffedCombatant(combatant, kitContext.kitEffectState.effects, party, kitContext.characterIdCombatantMap),
        ),
      );
      return;
    }

    kitContext.outbox.push(
      ...strikePartyMember(
        enemyTables,
        party,
        enemy,
        combatant,
        kitContext.kitEffectState,
        kitContext.characterIdCombatantMap,
      ),
    );
    respawnParty();
  };
  // A boar's charge lands on the character on the field through the team's shields, and a team it fells respawns
  const chargeParty = () => {
    const combatant = activeCombatant.value;
    if (!combatant) return;
    chargePartyMember(party, combatant, kitContext.kitEffectState, kitContext.characterIdCombatantMap);
    respawnParty();
  };
  // The sheer cold's damage lands on the character on the field the way a boar's charge does, through the team's shields,
  // And a team it fells respawns
  const coldDamageParty = (damage: number) => {
    const combatant = activeCombatant.value;
    if (!combatant) return;
    hitPartyMember(party, combatant, kitContext.kitEffectState, kitContext.characterIdCombatantMap, damage);
    respawnParty();
  };
  // A deployed member's Max HP as the buffs on it stand now, none while the member has no combatant built
  const getMemberMaxHealth = (characterId: number): number | undefined => {
    const combatant = kitContext.characterIdCombatantMap.get(characterId);
    return combatant
      ? getKitMaxHealth(combatant, kitContext.kitEffectState.effects, party, kitContext.characterIdCombatantMap)
      : undefined;
  };
  return {
    chargeParty,
    clearKitEffects,
    coldDamageParty,
    defeatEnemy,
    getMemberMaxHealth,
    hudMember,
    kitContext,
    locomotion,
    respawnParty,
    reviveFallenParty,
    strikeParty,
  };
};
