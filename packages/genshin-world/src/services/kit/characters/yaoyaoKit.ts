import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { changeKitTeamHealth } from "#src/services/kit/effects/changeKitTeamHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { selectRandomKitEnemy } from "#src/services/kit/selectRandomKitEnemy";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { LocomotionState } from "genshin-engine";

export const YAOYAO_CHARACTER_ID = 10_000_077;

// Measured: gcsim (MIT) yaoyao/yuegui.go, a Yuegui throws at a random enemy within 8 metres of itself while its wielder's
// HP is above 70% of her Max HP, and at her own position otherwise
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/yuegui.go
const YUEGUI_TARGET_RADIUS_METRES = 8;
const YUEGUI_HEALTH_SHARE_THRESHOLD = 0.7;
// Measured: gcsim (MIT) yaoyao/skill.go, the Yuegui spawns two metres ahead of her body
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/skill.go
const YUEGUI_SPAWN_METRES = 2;
// Measured: gcsim (MIT) yaoyao/burst.go, Moonjade Descent's Yuegui spawns behind her, two metres back from her body
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/burst.go
const JUMPING_YUEGUI_METRES = 2;
const BURST_STATUS_ID = "yaoyao-burst";
const JUMPING_YUEGUI_ID = "yaoyao-jumping-yuegui";
// Measured: gcsim (MIT) yaoyao/cons.go, Constellation 1 gives the active character 15% Dendro DMG Bonus for eight seconds
// After each radish heal. Its stamina restore is not built, as the kit has no stamina to restore
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/cons.go
const CONSTELLATION_1 = 1;
const C1_DENDRO_DMG_BONUS = 0.15;
const C1_SECONDS = 8;
// Measured: gcsim (MIT) yaoyao/asc.go and radish.go, Ascension 4 heals the active character each second for five seconds
// After each radish heal, by 0.8% of Yaoyao's Max HP, and a newer radish heal replaces the one running
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/asc.go
const ASCENSION_4 = 4;
const A4_HEAL_MAX_HEALTH_SHARE = 0.008;
const A4_INTERVAL_SECONDS = 1;
const A4_SECONDS = 5;
const A4_HEAL_ID = "yaoyao-a4-heal";
// Measured: gcsim (MIT) yaoyao/cons.go, Constellation 2 gives Yaoyao 3 energy when a radish strikes an enemy while her burst
// Lasts, once each 0.8 seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/cons.go
const CONSTELLATION_2 = 2;
const C2_ENERGY = 3;
const C2_INTERVAL_SECONDS = 0.8;
const C2_ICD_ID = "yaoyao-c2-icd";
// Measured: gcsim (MIT) yaoyao/cons.go, Constellation 4 gives Yaoyao Elemental Mastery of 0.3% of her Max HP, up to 120,
// For 8.8 seconds on each skill and burst cast
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/cons.go
const CONSTELLATION_4 = 4;
const C4_ELEMENTAL_MASTERY_SHARE = 0.003;
const C4_ELEMENTAL_MASTERY_CAP = 120;
const C4_SECONDS = 8.8;
// Measured: gcsim (MIT) yaoyao/cons.go and yuegui.go, Constellation 6 throws a Mega Radish at the target of a skill Yuegui's
// Third and sixth radishes, healing the active character by 7.5% of Yaoyao's Max HP
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/cons.go
const CONSTELLATION_6 = 6;
const C6_THROW_INDICES = new Set([2, 5]);
const C6_HEAL_MAX_HEALTH_SHARE = 0.075;
// Measured: gcsim (MIT) yaoyao/asc.go, Ascension 1 throws a burst radish every 0.6 seconds of the burst while Yaoyao dashes or
// Jumps, at a random enemy within the 8 metres round her that a Yuegui targets, and throws none while no enemy stands there
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/asc.go
const ASCENSION_1 = 1;
const A1_INTERVAL_SECONDS = 0.6;
const A1_LOCOMOTION_STATES = new Set<LocomotionState>([LocomotionState.Dash, LocomotionState.Jump]);

// A radish lands where it is thrown: its hit strikes the enemies its circle reaches, and the heal it gives reaches the
// Character on the field from that point, only while the body stands within the circle as the radish lands, as gcsim's
// Radish heal checks the player's position
const landRadish = (
  context: KitContext,
  combatant: Combatant,
  target: GroundPoint,
  hit: KitHit,
  heal: (tick: KitContext) => void,
): void => {
  const { kitEffectState } = context;
  castKitSummon(
    kitEffectState,
    { facing: context.body.facing, height: context.body.height, position: target },
    combatant,
    [hit],
  );
  castKitField(kitEffectState, combatant.characterId, target, {
    nextTickSeconds: hit.hitmarkSeconds,
    onTick: heal,
    radius: hit.hitArea.radius,
    secondsRemaining: hit.hitmarkSeconds + SUMMON_LINGER_SECONDS,
    tickIntervalSeconds: Number.POSITIVE_INFINITY,
  });
};

// A Yuegui's throw targets a random enemy within its target circle while the active character stands above the health
// Share, and her own position otherwise, or when no enemy stands in the circle
const pickRadishTarget = (context: KitContext, yueguiCentre: GroundPoint): GroundPoint => {
  const { activeCombatant, body, enemyMap, party, random } = context;
  const isHealthy = getPartyMember(party, activeCombatant.characterId).healthShare > YUEGUI_HEALTH_SHARE_THRESHOLD;
  const enemy = isHealthy
    ? selectRandomKitEnemy(yueguiCentre, YUEGUI_TARGET_RADIUS_METRES, enemyMap.values(), random)
    : undefined;
  return enemy?.position ?? body.position;
};

// A radish's heal: its share of the thrower's Max HP and its flat amount, given to the active character, or to each member of
// The deployed team when it heals the team
interface RadishHeal {
  flat: number;
  healsTeam: boolean;
  maxHealthShare: number;
}

// Ascension 4's heal chain runs on the active character each interval for its seconds, a newer radish heal replacing it
const startA4Heal = (context: KitContext, combatant: Combatant): void => {
  const { kitEffectState } = context;
  removeKitEffects(kitEffectState, (effect) => effect.kind === "field" && effect.id === A4_HEAL_ID);
  castKitField(
    kitEffectState,
    combatant.characterId,
    { x: 0, z: 0 },
    {
      id: A4_HEAL_ID,
      nextTickSeconds: A4_INTERVAL_SECONDS,
      onTick: (tick) =>
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          A4_HEAL_MAX_HEALTH_SHARE * combatant.attributes.maxHealth,
        ),
      secondsRemaining: A4_SECONDS,
      tickIntervalSeconds: A4_INTERVAL_SECONDS,
    },
  );
};

// Constellation 1 and Ascension 4 follow each radish's heal, as gcsim's radish heal does
const applyRadishHealRiders = (context: KitContext, combatant: Combatant): void => {
  const { activeCombatant, kitEffectState } = context;
  if (combatant.constellationCount >= CONSTELLATION_1)
    buffKitMember(kitEffectState, activeCombatant.characterId, {
      amount: C1_DENDRO_DMG_BONUS,
      attribute: Attribute.DendroDamageBonus,
      secondsRemaining: C1_SECONDS,
    });
  if (combatant.ascension >= ASCENSION_4) startA4Heal(context, combatant);
};

// A healing radish lands at a target, pricing its heal from the thrower's Max HP as it is thrown: the team's members, or
// The active character, heal by it, and it rides Constellation 1 and Ascension 4 as it lands
const landHealingRadish = (
  context: KitContext,
  combatant: Combatant,
  target: GroundPoint,
  hit: KitHit,
  { flat, healsTeam, maxHealthShare }: RadishHeal,
): void => {
  const healing = maxHealthShare * combatant.attributes.maxHealth + flat;
  landRadish(context, combatant, target, hit, (tick) => {
    if (healsTeam) changeKitTeamHealth(tick, combatant, healing);
    else changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, healing);
    applyRadishHealRiders(tick, combatant);
  });
};

// A Yuegui throws a radish at its target, and returns the target, for a Mega Radish to fly at the same one
const throwRadish = (
  context: KitContext,
  combatant: Combatant,
  yueguiCentre: GroundPoint,
  hit: KitHit,
  heal: RadishHeal,
): GroundPoint => {
  const target = pickRadishTarget(context, yueguiCentre);
  landHealingRadish(context, combatant, target, hit, heal);
  return target;
};

// Constellation 6's Mega Radish lands at the target of the throw beside it, healing the active character with no riders
const throwMegaRadish = (context: KitContext, combatant: Combatant, target: GroundPoint, hit: KitHit): void => {
  const healing = C6_HEAL_MAX_HEALTH_SHARE * combatant.attributes.maxHealth;
  landRadish(context, combatant, target, hit, (tick) =>
    changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, healing),
  );
};

// Ascension 1's radish lands on a random enemy within the circle round Yaoyao, healing as a burst radish does, and none is
// Thrown while no enemy stands there
const throwAscensionRadish = (context: KitContext, combatant: Combatant, hit: KitHit, heal: RadishHeal): void => {
  const { body, enemyMap, random } = context;
  const enemy = selectRandomKitEnemy(body.position, YUEGUI_TARGET_RADIUS_METRES, enemyMap.values(), random);
  if (enemy) landHealingRadish(context, combatant, enemy.position, hit, heal);
};

// Ascension 1's ticker: each interval of the burst it throws while Yaoyao dashes or jumps, and queues its next tick while the
// Burst lasts, which a swap ends
const scheduleAscensionTick = (context: KitContext, combatant: Combatant, hit: KitHit, heal: RadishHeal): void => {
  scheduleKitTask(context.kitEffectState, combatant.characterId, A1_INTERVAL_SECONDS, (tick) => {
    const burst = findKitStatus(tick.kitEffectState.effects, combatant.characterId, BURST_STATUS_ID);
    if (!burst || burst.secondsRemaining <= 0) return;
    if (A1_LOCOMOTION_STATES.has(tick.locomotionState)) throwAscensionRadish(tick, combatant, hit, heal);
    scheduleAscensionTick(tick, combatant, hit, heal);
  });
};

// Constellation 2: a radish that strikes an enemy while the burst lasts gives Yaoyao energy, once each interval
const giveConstellation2Energy = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (
    combatant.constellationCount < CONSTELLATION_2 ||
    !checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, BURST_STATUS_ID)
  )
    return;
  if (!startKitCooldown(kitEffectState, combatant.characterId, C2_ICD_ID, C2_INTERVAL_SECONDS)) return;
  gainPartyMemberEnergy(party, combatant, C2_ENERGY);
};

// Constellation 4: the Elemental Mastery Yaoyao gains on each skill and burst cast
const applyConstellation4 = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  if (combatant.constellationCount < CONSTELLATION_4) return;
  buffKitMember(kitEffectState, combatant.characterId, {
    amount: Math.min(C4_ELEMENTAL_MASTERY_SHARE * combatant.attributes.maxHealth, C4_ELEMENTAL_MASTERY_CAP),
    attribute: Attribute.ElementalMastery,
    secondsRemaining: C4_SECONDS,
  });
};

// Yaoyao's behaviour: her Yuegui, which her skill spawns, throws a White Jade Radish each throw interval at a target the
// Pick above chooses. Her burst spawns three Yuegui behind her while it lasts, whose radishes heal the whole team, and a
// Swap ends the burst and the Yuegui it spawned. Each radish heal gives Constellation 1's Dendro DMG Bonus and Ascension 4's
// Heal chain, and Constellation 2 and 4 follow her radishes' strikes and her casts
// Ascension 1 throws a burst radish each 0.6 seconds of the burst while she dashes or jumps
// Constellation 1's stamina restore needs a stamina pool the kit does not carry, so it is not built
// Constellation 6 throws a Mega Radish at the skill Yuegui's third and sixth radishes, at the same target
export const createYaoyaoKitBehaviour = ({
  readHit,
  readParameter,
  readSecondsList,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillRadish = readHit("skillRadish", { onStrike: giveConstellation2Energy });
  const skillRadishHeal: RadishHeal = {
    flat: readParameter("skillRadishFlatHeal"),
    healsTeam: false,
    maxHealthShare: readParameter("skillRadishHealMaxHealthShare"),
  };
  const megaRadish = readHit("megaRadish");
  const yueguiSpawnSeconds = readSeconds("skillCooldownStart") + readSeconds("yueguiSpawnDelay");
  const yueguiFirstThrowSeconds = readSeconds("yueguiFirstThrow");
  const yueguiThrowIntervalSeconds = readSeconds("yueguiThrowInterval");
  const yueguiDurationSeconds = readSeconds("yueguiDuration");
  const burstRadish = readHit("burstRadish", { onStrike: giveConstellation2Energy });
  const burstRadishHeal: RadishHeal = {
    flat: readParameter("burstRadishFlatHeal"),
    healsTeam: true,
    maxHealthShare: readParameter("burstRadishHealMaxHealthShare"),
  };
  const burstDurationSeconds = readSeconds("burstDuration");
  const jumpingYueguiSpawnSecondsList = readSecondsList("jumpingYueguiSpawns");

  return {
    burst: {
      // Moonjade Descent lasts for its duration, and spawns a Yuegui behind her at each of its three spawns while it lasts
      onStart: (context) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        const { characterId } = combatant;
        applyConstellation4(context);
        addKitStatus(kitEffectState, characterId, { id: BURST_STATUS_ID, secondsRemaining: burstDurationSeconds });
        for (const spawnSeconds of jumpingYueguiSpawnSecondsList)
          scheduleKitTask(kitEffectState, characterId, spawnSeconds, (tick) => {
            const burst = findKitStatus(tick.kitEffectState.effects, characterId, BURST_STATUS_ID);
            // A burst a swap has ended stands with no seconds left, so its Yuegui spawns no more
            if (!burst || burst.secondsRemaining <= 0) return;
            const yueguiCentre = createAheadBody(tick.body, -JUMPING_YUEGUI_METRES).position;
            castKitField(tick.kitEffectState, characterId, yueguiCentre, {
              id: JUMPING_YUEGUI_ID,
              nextTickSeconds: yueguiFirstThrowSeconds,
              onTick: (throwContext) => {
                throwRadish(throwContext, combatant, yueguiCentre, burstRadish, burstRadishHeal);
              },
              secondsRemaining: burst.secondsRemaining,
              tickIntervalSeconds: yueguiThrowIntervalSeconds,
            });
          });
        if (combatant.ascension >= ASCENSION_1) scheduleAscensionTick(context, combatant, burstRadish, burstRadishHeal);
      },
    },
    // Swapping off Yaoyao ends her burst and the Yuegui it spawned, which then throw nothing
    onKitEvent: (event: KitEvent, context: KitContext, combatant: Combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      const burst = findKitStatus(context.kitEffectState.effects, combatant.characterId, BURST_STATUS_ID);
      if (burst) burst.secondsRemaining = 0;
      removeKitEffects(context.kitEffectState, (effect) => effect.kind === "field" && effect.id === JUMPING_YUEGUI_ID);
    },
    skill: {
      // Raphanus Sky Cluster schedules the Yuegui's spawn, two metres ahead of where Yaoyao's body stands when it spawns
      onStart: (context) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        applyConstellation4(context);
        scheduleKitTask(kitEffectState, combatant.characterId, yueguiSpawnSeconds, (tick) => {
          const yueguiCentre = createAheadBody(tick.body, YUEGUI_SPAWN_METRES).position;
          castKitField(tick.kitEffectState, combatant.characterId, yueguiCentre, {
            nextTickSeconds: yueguiFirstThrowSeconds,
            onTick: (throwContext, tickIndex) => {
              const target = throwRadish(throwContext, combatant, yueguiCentre, skillRadish, skillRadishHeal);
              if (combatant.constellationCount >= CONSTELLATION_6 && C6_THROW_INDICES.has(tickIndex))
                throwMegaRadish(throwContext, combatant, target, megaRadish);
            },
            secondsRemaining: yueguiDurationSeconds,
            tickIntervalSeconds: yueguiThrowIntervalSeconds,
          });
        });
      },
    },
  };
};
