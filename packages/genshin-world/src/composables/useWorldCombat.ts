import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { HudMember } from "#src/models/hud/HudMember";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { readStatTables } from "#src/services/character/readStatTables";
import { createCharacter } from "#src/services/character/createCharacter";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { createCharacterKit } from "#src/services/kit/createCharacterKit";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { createParty } from "#src/services/party/createParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { createSeededRandom } from "genshin-engine";
import { getResultAsync } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";

// The party the player fields, the characters it is made of and their combat, the enemies the world holds and the kit's
// Effects on the team. A defeat places its drops and is a doing the quests count, and a team that falls revives where the
// Host places it
export const useWorldCombat = ({
  events,
  onPartyRevived,
  placeWorldDrops,
}: {
  events: WorldEvents;
  onPartyRevived: () => void;
  placeWorldDrops: (enemy: Enemy, enemyDrops: EnemyDrops) => void;
}) => {
  // The game's stat tables, read as the world starts rather than with the package, which the opening downloads, and the
  // Player's characters made from them and their party: the Traveler alone, as a new player's, on the field. Until the
  // Tables arrive nobody walks the field and the character screen opens as a placeholder, and tables that fail to arrive
  // Are logged and leave it so
  const statTables = shallowRef<StatTables>();
  const characters = shallowRef<Character[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(readStatTables).match(
    (newStatTables) => {
      statTables.value = newStatTables;
      characters.value = [createCharacter(TRAVELER_CHARACTER_ID, newStatTables.characterDataMap)];
    },
    (error) => {
      console.error(error);
    },
  );
  const party = reactive(createParty([TRAVELER_CHARACTER_ID]));
  // The combat talent multipliers of the deployed team, read as the world starts and again whenever the team changes, each
  // Character's chunk on demand. The Traveler's kit is built from them once they arrive, and nothing is priced until then
  const talentMultipliers = shallowRef<TalentMultiplierMap>();
  // The characters whose chunks have been read, whose kits are built from the multipliers
  const loadedCharacterIds = shallowRef<number[]>([]);
  const deployedCharacterIds = computed(() => party.teams[party.deployedTeamIndex]?.characterIds ?? []);
  watchImmediate(deployedCharacterIds, (characterIds) => {
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    // The Traveler's chunk is read beside the team's, since a character with no kit of its own fights with the Traveler's
    getResultAsync(() => readTalentMultipliers([...new Set([TRAVELER_CHARACTER_ID, ...characterIds])])).match(
      (newTalentMultipliers) => {
        talentMultipliers.value = { ...talentMultipliers.value, ...newTalentMultipliers };
        loadedCharacterIds.value = [...new Set([...loadedCharacterIds.value, TRAVELER_CHARACTER_ID, ...characterIds])];
      },
      (error) => {
        console.error(error);
      },
    );
  });
  const characterIdKitMap = computed(() => {
    const kitMap = new Map<number, Kit>();
    if (!talentMultipliers.value) return kitMap;
    for (const characterId of loadedCharacterIds.value)
      kitMap.set(characterId, createCharacterKit(characterId, talentMultipliers.value));
    return kitMap;
  });
  // How the character on the field moves, its body type's, once the roster has arrived
  const locomotion = computed(() =>
    statTables.value
      ? getCharacterLocomotion(getActiveCharacterId(party), statTables.value.characterDataMap)
      : undefined,
  );
  // Each character's combat once the roster has arrived and its kit is built from its loaded multipliers, a character whose
  // Chunk has not arrived having none yet. The character on the field's combat and its party member are what the HUD's
  // Health and skills read
  const characterIdCombatantMap = computed(() => {
    const combatantMap = new Map<number, Combatant>();
    if (!statTables.value) return combatantMap;
    // The deployed team's resonances, read off its members' elements in the roster, which hold on every member
    const { characterDataMap } = statTables.value;
    const elementalResonances = getElementalResonances(
      (party.teams[party.deployedTeamIndex]?.characterIds ?? []).flatMap((characterId) => {
        const element = characterDataMap.get(characterId)?.element;
        return element ? [element] : [];
      }),
    );
    for (const character of characters.value) {
      const kit = characterIdKitMap.value.get(character.id);
      if (kit)
        combatantMap.set(character.id, {
          ascension: character.ascension,
          attributes: computeCharacterAttributes(
            getCharacterAttributeLines(character, statTables.value),
            elementalResonances,
          ),
          characterId: character.id,
          constellationCount: character.constellationCount,
          elementalResonances,
          kit,
          level: character.level,
        });
    }
    return combatantMap;
  });
  const activeCombatant = computed(() => characterIdCombatantMap.value.get(getActiveCharacterId(party)));
  const activePartyMember = computed(() => getPartyMember(party, getActiveCharacterId(party)));
  // The field member's figures the HUD's health and skill buttons show, none until the character on the field is known
  const hudMember = computed<HudMember | undefined>(() => {
    const combatant = activeCombatant.value;
    if (!combatant) return undefined;
    const partyMember = activePartyMember.value;
    return {
      burstCooldown: partyMember.burstCooldownSeconds,
      burstCooldownSeconds: combatant.kit.burstCooldownSeconds,
      energy: partyMember.energy,
      energyCost: combatant.kit.burstEnergyCost,
      health: partyMember.healthShare * combatant.attributes.maxHealth,
      level: combatant.level,
      maxHealth: combatant.attributes.maxHealth,
      skillCooldown: partyMember.skillCooldownSeconds,
      skillCooldownSeconds: combatant.kit.skillCooldownSeconds,
    };
  });
  // The enemies in the world by their spawn key, which the enemies write as their camps load and as they die, and which
  // The character's kit strikes and an enemy's strike lands from
  const enemyMap = new Map<string, Enemy>();
  // The effects on the deployed team, the shields and taunts an enemy's strike is taken by, which the character on the field
  // Steps and the enemies read, and which the character clears on a drown or a jump
  const kitEffectState: KitEffectState = { effects: [] };
  const clearKitEffects = () => {
    kitEffectState.effects = [];
  };
  // The world's one seeded random source, which the combat and the kit draw their rolls on, so a session's rolls repeat
  const worldRandom = createSeededRandom(WORLD_RANDOM_SEED);
  // A defeated enemy's drops lie where it fell, numbered on from the drops placed before them, and the defeat is a doing
  // The quests in progress count
  const defeatEnemy = (enemy: Enemy, enemyDrops: EnemyDrops) => {
    placeWorldDrops(enemy, enemyDrops);
    events.emit("defeatEnemy", enemy);
    events.emit("questEvent", { kind: QuestObjectiveKind.Defeat, targetId: String(enemy.enemyKindId) });
  };
  // A team that has all fallen revives at the share the game brings it back with, and is jumped to where the host places it
  const respawnParty = () => {
    if (!checkIsPartyDown(party)) return;
    reviveParty(party);
    onPartyRevived();
  };
  // An enemy's strike lands on the taunt it struck, or on the character on the field through the team's shields, and a team
  // It fells respawns
  const strikeParty = (enemy: Enemy, taunt?: KitTaunt) => {
    const combatant = activeCombatant.value;
    if (!combatant) return;
    if (taunt) {
      damageKitTaunt(taunt, computeEnemyStrikeDamage(enemy, combatant));
      return;
    }

    strikePartyMember(party, enemy, combatant, kitEffectState);
    respawnParty();
  };
  return {
    characterIdCombatantMap,
    characters,
    clearKitEffects,
    defeatEnemy,
    enemyMap,
    hudMember,
    kitEffectState,
    locomotion,
    party,
    respawnParty,
    statTables,
    strikeParty,
    worldRandom,
  };
};
