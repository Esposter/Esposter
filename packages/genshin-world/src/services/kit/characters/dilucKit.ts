import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

// Dawn's infusion lasts 8 seconds, and A4 extends it by 4 seconds and gives a 20% Pyro damage bonus for as long
// Wiki: the Dawn infusion's duration and A4's extension and damage bonus, as gcsim v2.47.2 (MIT) diluc/burst.go gives them
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DILUC_INFUSION_SECONDS = 8;
const DILUC_A4_EXTRA_INFUSION_SECONDS = 4;
const DILUC_A4_PYRO_DAMAGE_BONUS = 0.2;
const DILUC_RELENTLESS_ASCENSION = 1;
const DILUC_RELENTLESS_STAMINA_MULTIPLIER = 0.5;

// Measured: gcsim v2.47.2 (MIT) diluc/burst.go, the phoenix spawns a metre ahead of the body and moves 14 metres a second,
// Striking eight times from its launch, and exploding 1.7 seconds after its launch, 24.8 metres on
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/burst.go
const DAWN_SPAWN_METRES = 1;
const DAWN_METRES_PER_SECOND = 14;
const DAWN_TICK_COUNT = 8;
const DAWN_EXPLOSION_SECONDS = 1.7;

// Constellation 4, Flowing Flame: 2s after a Searing Onslaught press, the next press in the combo deals 40% more DMG, for 2s.
// Wiki: the Flowing Flame constellation's text, as gcsim v2.47.2 (MIT) diluc/cons.go models it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DAMAGE_BONUS = 0.4;
const CONSTELLATION_4_SECONDS = 2;
const CONSTELLATION_4_STATUS_ID = "diluc-constellation-4-press";

// Constellation 6, Flaming Sword, Nemesis of the Dark: after a Searing Onslaught press, the next two normal attacks within
// Six seconds deal 30% more DMG and attack 30% faster. Wiki: the constellation's text, as gcsim v2.47.2 (MIT) diluc/cons.go
// Models it, its counter reset by each press and its buffs ending after six seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/cons.go
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_BONUS = 0.3;
const CONSTELLATION_6_SECONDS = 6;
const CONSTELLATION_6_ATTACKS = 2;
const CONSTELLATION_6_ARMED_STATUS_ID = "diluc-constellation-6-armed";
const CONSTELLATION_6_ATTACK_STATUS_ID = "diluc-constellation-6-attack";

export const DILUC_CHARACTER_ID = 10_000_016;

// Constellation 1, Conviction: Diluc's strikes deal 15% more DMG to an enemy whose HP is above half, as the wiki's
// Constellation page gives it
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_DAMAGE_BONUS = 0.15;
const CONSTELLATION_1_HEALTH_SHARE = 0.5;

// Searing Ember, from Constellation 2: each damage Diluc takes raises his ATK by 10% and his ATK SPD by 5% for 10 seconds,
// Up to three stacks, and one stack at most every 1.5 seconds. gcsim v2.47.2 (MIT) diluc/cons.go gives the stacks and the
// 10 seconds, and the 1.5 seconds is the wiki's, gcsim's interval never being set
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diluc/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_BONUS_PER_STACK = 0.1;
const CONSTELLATION_2_ATTACK_SPEED_BONUS_PER_STACK = 0.05;
const CONSTELLATION_2_STACK_CAP = 3;
const CONSTELLATION_2_SECONDS = 10;
const CONSTELLATION_2_INTERVAL_SECONDS = 1.5;
const CONSTELLATION_2_STACK_STATUS_ID = "diluc-constellation-2-stacks";
const CONSTELLATION_2_INTERVAL_STATUS_ID = "diluc-constellation-2-interval";
const CONSTELLATION_2_SOURCE = "diluc-constellation-2";

// Adds a stack of Searing Ember to Diluc: the count goes on from the last stack while it runs, and restarts at one
// Once it has run out, and the stacks' ATK and ATK SPD restart with their 10 seconds
const addSearingEmberStack = (kitEffectState: KitEffectState, characterId: number): void => {
  const previousStacks = checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_2_STACK_STATUS_ID)
    ? (findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_2_STACK_STATUS_ID)?.stacks ?? 0)
    : 0;
  const stacks = Math.min(CONSTELLATION_2_STACK_CAP, previousStacks + 1);
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_2_STACK_STATUS_ID,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    stacks,
  });
  buffKitMember(kitEffectState, characterId, {
    amount: stacks * CONSTELLATION_2_ATTACK_BONUS_PER_STACK,
    attribute: Attribute.AttackPercent,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    source: CONSTELLATION_2_SOURCE,
  });
  buffKitMember(kitEffectState, characterId, {
    amount: stacks * CONSTELLATION_2_ATTACK_SPEED_BONUS_PER_STACK,
    attribute: Attribute.NormalAttackSpeed,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    source: CONSTELLATION_2_SOURCE,
  });
};

// Diluc's behaviour: Dawn infuses his attacks with Pyro, lengthened and joined by a Pyro DMG Bonus from Ascension 4, and
// Launches its phoenix at the slash, a summon a metre ahead of him that travels forward, strikes on each of its ticks and
// Explodes at the end of its path
// Constellation 2 is built for a hit on Diluc that costs him HP, an enemy's strike, a drown or a wildlife's charge, and for
// An enemy's strike on him that a shield takes, whoever owns the shield, as gcsim's OnPlayerHit fires on a shielded hit. The
// Damageless hits of his teammates are not built
// Constellation 4 reads each press against the one before it. The status a press leaves runs two seconds, so a press that
// Finds it running came within two seconds of the last one. A follow-up that does not is the one the bonus lands on, and
// Its status carries the bonus for the same two seconds. Constellation 6 arms the next two normal attacks on each press
const createSearingOnslaughtPress =
  (isFollowUp: boolean) =>
  ({ activeCombatant: combatant, kitEffectState }: KitContext) => {
    const { characterId, constellationCount } = combatant;
    if (constellationCount >= CONSTELLATION_4) {
      const isWithinTwoSeconds = checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_4_STATUS_ID);
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        stacks: isFollowUp && !isWithinTwoSeconds ? 1 : 0,
      });
    }
    if (constellationCount >= CONSTELLATION_6)
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_6_ARMED_STATUS_ID,
        secondsRemaining: CONSTELLATION_6_SECONDS,
        stacks: CONSTELLATION_6_ATTACKS,
      });
  };

// Constellation 6: each normal attack of the combo takes one of the armed attacks while any remain, and its own status runs
// For the attack's seconds, which the damage hook and the speed bonus read. An attack the armed ones do not reach clears it
const createNormalAttackStart =
  (seconds: number) =>
  ({ activeCombatant: combatant, kitEffectState }: KitContext) => {
    if (combatant.constellationCount < CONSTELLATION_6) return;
    const { characterId } = combatant;
    const armed = findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_6_ARMED_STATUS_ID);
    const armedStacks = armed?.stacks ?? 0;
    const isBuffed =
      checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_6_ARMED_STATUS_ID) && armedStacks > 0;
    if (isBuffed && armed)
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_6_ARMED_STATUS_ID,
        secondsRemaining: armed.secondsRemaining,
        stacks: armedStacks - 1,
      });
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_6_ATTACK_STATUS_ID,
      secondsRemaining: isBuffed ? seconds : 0,
    });
  };

// Constellation 6's bonus to a normal attack that is buffed, as its status runs for the attack
const isConstellation6Buffed = (characterId: number, effects: readonly KitEffect[]): boolean =>
  checkIsKitStatusActive(effects, characterId, CONSTELLATION_6_ATTACK_STATUS_ID);

// Constellation 4's bonus, as the status a follow-up press leaves on Diluc runs, for his skill's strikes
const getConstellation4DamageBonus = ({ attackTag, combatant }: KitStrike, effects: readonly KitEffect[]): number =>
  combatant.constellationCount >= CONSTELLATION_4 &&
  attackTag === AttackTag.ElementalSkill &&
  checkIsKitStatusActive(effects, combatant.characterId, CONSTELLATION_4_STATUS_ID) &&
  findKitStatus(effects, combatant.characterId, CONSTELLATION_4_STATUS_ID)?.stacks === 1
    ? CONSTELLATION_4_DAMAGE_BONUS
    : 0;

export const createDilucKitBehaviour = ({
  kit,
  readArea,
  readHitFields,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  // The phoenix launches as the slash lands
  const launchSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const dawnPhoenixFields = readHitFields("dawnPhoenixHit", ["hitArea", "hitmarkSeconds", "talentMultiplier"]);
  const dawnTickArea = readArea("dawnTick");
  const dawnTickIntervalSeconds = readSeconds("dawnTickInterval");
  const dawnTickMultiplier = readParameter("dawnTickMultiplier");
  const dawnPhoenixTicks = Array.from({ length: DAWN_TICK_COUNT }, (_value, index): KitHit => ({
    ...dawnPhoenixFields,
    hitArea: dawnTickArea,
    hitmarkSeconds: launchSeconds + dawnTickIntervalSeconds * (index + 1),
    talentMultiplier: dawnTickMultiplier,
  }));
  const dawnPhoenixExplosion: KitHit = {
    ...dawnPhoenixFields,
    hitArea: readArea("dawnExplosion"),
    hitmarkSeconds: launchSeconds + DAWN_EXPLOSION_SECONDS,
    talentMultiplier: readParameter("dawnExplosionMultiplier"),
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        const hasA4 = combatant.ascension >= 4;
        const secondsRemaining = DILUC_INFUSION_SECONDS + (hasA4 ? DILUC_A4_EXTRA_INFUSION_SECONDS : 0);
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining,
        });
        if (hasA4)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: DILUC_A4_PYRO_DAMAGE_BONUS,
            attribute: Attribute.PyroDamageBonus,
            secondsRemaining,
          });
        castKitSummon(
          kitEffectState,
          {
            facing,
            height,
            position: {
              x: position.x - Math.sin(facing) * DAWN_SPAWN_METRES,
              z: position.z - Math.cos(facing) * DAWN_SPAWN_METRES,
            },
          },
          combatant,
          [...dawnPhoenixTicks, dawnPhoenixExplosion],
          { travel: { metresPerSecond: DAWN_METRES_PER_SECOND, startSeconds: launchSeconds } },
        );
      },
    },
    // Searing Ember: a hit on Diluc takes a stack once the interval after the last one has run out. A hit is one that costs
    // Him HP, or that a shield takes whole or in part, which names him as the member struck. A kit of the team that names
    // Its source for the HP loss, such as Furina's skill, is not a hit
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (combatant.constellationCount < CONSTELLATION_2) return;
      const { characterId } = combatant;
      const isHit =
        event.kind === KitEventKind.ShieldAbsorbed
          ? event.struckCharacterId === characterId
          : event.kind === KitEventKind.HealthChanged &&
            event.characterId === characterId &&
            event.healthShare < 0 &&
            event.sourceCharacterId === undefined;
      if (!isHit) return;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_2_INTERVAL_STATUS_ID)) return;
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_2_INTERVAL_STATUS_ID,
        secondsRemaining: CONSTELLATION_2_INTERVAL_SECONDS,
      });
      addSearingEmberStack(kitEffectState, characterId);
    },
    // Relentless, from Ascension 1: his charged attacks cost half their stamina
    // Its +3s duration clause is not built, since the talent text does not name what that duration is
    getChargedAttackStaminaMultiplier: ({ activeCombatant }) =>
      activeCombatant.ascension >= DILUC_RELENTLESS_ASCENSION ? DILUC_RELENTLESS_STAMINA_MULTIPLIER : 1,
    getNormalAttackSpeedBonus: ({ activeCombatant, kitEffectState }) =>
      activeCombatant.constellationCount >= CONSTELLATION_6 &&
      isConstellation6Buffed(activeCombatant.characterId, kitEffectState.effects)
        ? CONSTELLATION_6_BONUS
        : 0,
    getStrikeDamageBonus: (strike, enemy, _party, effects = []) =>
      (strike.combatant.constellationCount >= CONSTELLATION_1 &&
      enemy.health > enemy.maxHealth * CONSTELLATION_1_HEALTH_SHARE
        ? CONSTELLATION_1_DAMAGE_BONUS
        : 0) +
      getConstellation4DamageBonus(strike, effects) +
      (strike.combatant.constellationCount >= CONSTELLATION_6 &&
      strike.attackTag === AttackTag.NormalAttack &&
      isConstellation6Buffed(strike.combatant.characterId, effects)
        ? CONSTELLATION_6_BONUS
        : 0),
    normalAttacks: kit.normalAttacks.map((action) => ({ onStart: createNormalAttackStart(action.seconds) })),
    skill: { onStart: createSearingOnslaughtPress(false) },
    skillChain: kit.elementalSkillChain?.followUps.map(() => ({ onStart: createSearingOnslaughtPress(true) })),
  };
};
