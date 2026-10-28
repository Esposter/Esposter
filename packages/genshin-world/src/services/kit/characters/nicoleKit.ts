import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEnemyHitEvent } from "#src/models/kit/KitEnemyHitEvent";
import type { KitHitbox } from "#src/models/kit/KitHitbox";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { ALBEDO_CHARACTER_ID } from "#src/services/kit/characters/albedoKit";
import { KLEE_CHARACTER_ID } from "#src/services/kit/characters/kleeKit";
import { RAZOR_CHARACTER_ID } from "#src/services/kit/characters/razorKit";
import { SUCROSE_CHARACTER_ID } from "#src/services/kit/characters/sucroseKit";
import { checkIsInKitHitbox } from "#src/services/kit/checkIsInKitHitbox";
import { checkIsKitSecretRite } from "#src/services/kit/checkIsKitSecretRite";
import { checkIsKitHexerei } from "#src/services/kit/countKitHexereiMembers";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { ID_SEPARATOR } from "@esposter/shared";

export const NICOLE_CHARACTER_ID = 10_000_131;

// Revelation's shield and the team's ATK buff come on at the skill's hitmark less one frame, which gcsim queues on the
// Character's task (skill.go's QueueCharTask at skillHitmark-1)
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/nicole/skill.go
const SKILL_SNAPSHOT_FRAMES = 8;
// The shield and the buff last 20 seconds, gcsim's skillDur
const SKILL_SECONDS = 20;
// The buff's source is gcsim's skillBuffKey: a recast deletes the buff it gave before its own snapshot, so it restarts
const SKILL_BUFF_SOURCE = "grace-of-kenosis";

// The burst's status lasts 20 seconds, gcsim's burstKey
const BURST_SECONDS = 20;
// The burst starts its status and clears its projections one frame after its hit, as gcsim's task at burstHitmark+1 does,
// So a hit before that makes no projection
const BURST_STATUS_FRAMES = 109;
const BURST_STATUS_ID = "nicole-burst";
// A projection lands 30 frames after the hit that starts it, gcsim's projectionHitmark, and four come from one burst at most
const PROJECTION_FRAMES = 30;
const PROJECTION_LIMIT = 4;
// A projection holds a 3-second internal cooldown, gcsim's burstICDKey
const PROJECTION_ICD_SECONDS = 3;
const PROJECTION_ICD_ID = "nicole-burst-projection-icd";
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/nicole/burst.go

// The offsets are gcsim's meleeOffset and rangeOffset: a projection's hitbox sits about the enemy its burst hits, in the world's axes
const MELEE_OFFSET = { x: -1.5, z: 2.5 };
const RANGE_OFFSET = { x: -2.5, z: 2.5 };
const PROJECTION_RADIUS = 4.5;

// The kleeOffset is gcsim's: the melee offset pulled back a metre and a half along its own direction, then half a metre across it
const createKleeOffset = ({ x, z }: { x: number; z: number }): { x: number; z: number } => {
  const length = Math.hypot(x, z);
  const normX = x / length;
  const normZ = z / length;
  // The Perp in gcsim turns a point to (-Y, X), so the half metre runs along (-normZ, normX)
  return { x: x - normX * 1.5 - normZ * 0.5, z: z - normZ * 1.5 + normX * 0.5 };
};

// The hitbox a projection takes by the character it projects, as gcsim's projectionHitbox table has it, and the default for a
// Character the table does not name
const PROJECTION_HITBOXES = new Map<number, KitHitbox>([
  [ALBEDO_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "box", length: 8, width: 3 } }],
  [KLEE_CHARACTER_ID, { offset: createKleeOffset(MELEE_OFFSET), shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
  [RAZOR_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
  [SUCROSE_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
]);
const DEFAULT_PROJECTION_HITBOX: KitHitbox = {
  offset: RANGE_OFFSET,
  shape: { kind: "circle", radius: PROJECTION_RADIUS },
};
// A projection reaches its enemies by its hitbox alone, so its hit has no area of its own
const PROJECTION_HIT_AREA = { angle: 0, height: 0, radius: 0 };

// The first ascension gives the character on the field ATK 300 for as long as her skill's buff on it stands, three seconds
// After the swap in, at once for a Hexerei, and before the sixth constellation a swap away takes it off the character it
// Leaves, as gcsim's asc.go does. Her fourth ascension gives her own buff for eight seconds on each elemental hit of hers
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
const CONSTELLATION_6 = 6;
const ASCENSION_1_AMOUNT = 300;
const ASCENSION_1_SOURCE = "nicole-a1";
const ASCENSION_1_SWAP_SECONDS = 3;
const ASCENSION_1_SWAP_ID = "nicole-a1-swap";
const ASCENSION_4_SECONDS = 8;

// Her first constellation projects Arcane Projection: Unity from each hit of the active character, at six times the hit's
// Damage with a 6-second internal cooldown of its own, in a circle of 4.5 metres about the enemy it struck, as gcsim's cons.go does
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_MULTIPLIER = 6;
const CONSTELLATION_1_ICD_SECONDS = 6;
const CONSTELLATION_1_ICD_ID = "nicole-c1-icd";
const CONSTELLATION_1_HITBOX: KitHitbox = {
  offset: { x: 0, z: 0 },
  shape: { kind: "circle", radius: PROJECTION_RADIUS },
};

// Her second constellation gives each deployed member ATK 300 with her skill, and while an upgraded character's buff stands,
// Lowers the RES of that character's element by a quarter on each enemy within 10 metres of the team, every 0.3 seconds for
// A second, as gcsim's cons.go does
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_AMOUNT = 300;
const CONSTELLATION_2_SOURCE = "nicole-c2";
const CONSTELLATION_2_RADIUS = 10;
const CONSTELLATION_2_RES_REDUCTION = 0.25;
const CONSTELLATION_2_TICK_SECONDS = 0.3;
const CONSTELLATION_2_STATUS_SECONDS = 1;
const CONSTELLATION_2_TICKER_ID = "nicole-c2-ticker";
const CONSTELLATION_2_HITBOX: KitHitbox = {
  offset: { x: 0, z: 0 },
  shape: { kind: "circle", radius: CONSTELLATION_2_RADIUS },
};

// Her sixth constellation ignores 40% of the defence of each hit an upgraded character lands, its own and the team's,
// As gcsim's c6Init does, and its upgrades last for as long as her skill's buff stands, her own and each one she gives the
// Team, as gcsim's c6SelfBuffDur and c6OnUpgrade do
const CONSTELLATION_6_DEFENCE_IGNORED = 0.4;

// Whether a character holds an ascension upgrade, which her second constellation's RES reduction and her sixth's defence
// Ignored read
const checkIsUpgraded = (effects: readonly KitEffect[], characterId: number): boolean =>
  effects.some(
    (effect) => effect.kind === "buff" && effect.characterId === characterId && effect.source === ASCENSION_1_SOURCE,
  );

// The share of its enemy's defence a hit ignores under her sixth constellation, when its striker holds her upgrade
const getC6DefenceIgnored = (constellationCount: number, striker: Combatant, effects: readonly KitEffect[]): number =>
  constellationCount >= CONSTELLATION_6 && checkIsUpgraded(effects, striker.characterId)
    ? CONSTELLATION_6_DEFENCE_IGNORED
    : 0;

// Her fourth constellation gives an upgraded character 0.7 of her attack in flat base damage on each of its hits that is a
// Normal, charged, plunging, skill or burst attack, for eight stacks spent one each on the hits it lands. An upgrade gives
// Them again only once the character's 16-second cooldown has run out, as gcsim's c4OnUpgrade does. A projection carries no
// Attack tag, so it takes none
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_RATIO = 0.7;
const CONSTELLATION_4_STACKS = 8;
const CONSTELLATION_4_SECONDS = 20;
const CONSTELLATION_4_ID = "nicole-c4";
const CONSTELLATION_4_ICD_SECONDS = 16;
const CONSTELLATION_4_ICD_ID = "nicole-c4-icd";
const CONSTELLATION_4_ATTACK_TAGS = new Set<AttackTag>([
  AttackTag.ChargedAttack,
  AttackTag.ElementalBurst,
  AttackTag.ElementalSkill,
  AttackTag.NormalAttack,
  AttackTag.PlungingAttack,
]);

// The stacks of her fourth constellation a striker holds for a hit of the attack tag given, which the next hit it lands takes
const getC4Stacks = (effects: readonly KitEffect[], striker: number, attackTag: AttackTag | undefined): number => {
  if (attackTag === undefined || !CONSTELLATION_4_ATTACK_TAGS.has(attackTag)) return 0;
  const status = findKitStatus(effects, striker, CONSTELLATION_4_ID);
  return status && status.secondsRemaining > 0 ? (status.stacks ?? 0) : 0;
};

// Takes the stack a hit landed by its striker spends, as the hit lands on an enemy
const takeC4Stack = (effects: readonly KitEffect[], event: KitEnemyHitEvent): void => {
  if (getC4Stacks(effects, event.striker.characterId, event.attackTag) === 0) return;
  const status = findKitStatus(effects, event.striker.characterId, CONSTELLATION_4_ID);
  if (status) status.stacks = (status.stacks ?? 0) - 1;
};

// Schedules a projection of a hit onto the enemy it struck, landing 30 frames on as gcsim's projectionHitmark does. It deals
// The striker's element and prices the Hexerei bonus at its tick
const scheduleProjection = (
  kitEffectState: KitEffectState,
  nicole: Combatant,
  event: KitEnemyHitEvent,
  talentMultiplier: number,
  hitbox: KitHitbox,
): void => {
  scheduleKitTask(kitEffectState, nicole.characterId, toKitSeconds(PROJECTION_FRAMES), (tick) => {
    // The Hexerei projection bonus, gcsim's hexereiOnProjection: three times her attack when she and the projected character are
    // Hexerei and two or more Hexerei are deployed
    const flatDamage =
      checkIsKitHexerei(nicole.characterId) &&
      checkIsKitHexerei(event.striker.characterId) &&
      checkIsKitSecretRite(getDeployedCharacterIds(tick.party))
        ? nicole.attributes.attack * 3
        : 0;
    strikeKitEnemies(
      [
        {
          body: tick.body,
          combatant: event.striker,
          hit: {
            additiveBaseDamageBonus: () => flatDamage,
            element: event.striker.element,
            hitArea: PROJECTION_HIT_AREA,
            hitmarkSeconds: 0,
            poiseDamage: 0,
            talentMultiplier,
          },
          hitbox,
          target: event.enemy,
        },
      ],
      tick,
    );
  });
};

// Starts the ticker of the second constellation for an upgraded character, which each 0.3 seconds lowers its element's RES by a
// Quarter on each enemy within 10 metres of the team, gcsim's c2Ticker. A newer upgrade of the character replaces its ticker,
// And the ticker stops with the upgrade's own seconds
const startC2Ticker = (
  kitEffectState: KitEffectState,
  nicoleCharacterId: number,
  characterId: number,
  seconds: number,
): void => {
  const id = `${CONSTELLATION_2_TICKER_ID}${ID_SEPARATOR}${characterId}`;
  castKitField(
    kitEffectState,
    nicoleCharacterId,
    { x: 0, z: 0 },
    {
      id,
      nextTickSeconds: 0,
      onTick: (tick) => {
        const element = tick.characterIdCombatantMap.get(characterId)?.element;
        if (element === undefined || !checkIsUpgraded(tick.kitEffectState.effects, characterId)) return;
        for (const enemy of tick.enemyMap.values())
          if (checkIsInKitHitbox(CONSTELLATION_2_HITBOX, tick.body.position, enemy.position))
            addEnemyStatus(enemy, {
              damageTakenBonus: 0,
              id: `${CONSTELLATION_2_SOURCE}${ID_SEPARATOR}${element}`,
              resistanceReduction: { [element]: CONSTELLATION_2_RES_REDUCTION },
              secondsRemaining: CONSTELLATION_2_STATUS_SECONDS,
            });
      },
      secondsRemaining: seconds,
      tickIntervalSeconds: CONSTELLATION_2_TICK_SECONDS,
    },
  );
};

// Upgrades a member's ascension buff for the seconds given, or, when none is given, for as long as her skill's buff on the
// Member stands, and never longer than that skill's buff. A repeat upgrade restarts the buff rather than stacking it, as
// Gcsim's mod with the same key does
const upgradeAscensionBuff = (
  context: KitContext,
  nicole: Combatant,
  characterId: number,
  seconds = Infinity,
): void => {
  const { kitEffectState, party } = context;
  const skillBuff = kitEffectState.effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" && effect.characterId === characterId && effect.source === SKILL_BUFF_SOURCE,
  );
  const buffSeconds = Math.min(seconds, skillBuff?.secondsRemaining ?? 0);
  if (buffSeconds <= 0) return;
  buffKitMember(kitEffectState, characterId, {
    amount: ASCENSION_1_AMOUNT,
    attribute: Attribute.Attack,
    secondsRemaining: buffSeconds,
    source: ASCENSION_1_SOURCE,
  });
  if (nicole.constellationCount >= CONSTELLATION_2)
    startC2Ticker(kitEffectState, nicole.characterId, characterId, buffSeconds);
  if (
    nicole.constellationCount >= CONSTELLATION_4 &&
    startKitCooldown(kitEffectState, characterId, CONSTELLATION_4_ICD_ID, CONSTELLATION_4_ICD_SECONDS)
  )
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_4_ID,
      secondsRemaining: CONSTELLATION_4_SECONDS,
      stacks: CONSTELLATION_4_STACKS,
    });
  // Her sixth constellation upgrades each other deployed member with her own upgrade, as gcsim's c6OnUpgrade does
  if (characterId === nicole.characterId && nicole.constellationCount >= CONSTELLATION_6)
    for (const memberId of getDeployedCharacterIds(party))
      if (memberId !== nicole.characterId) upgradeAscensionBuff(context, nicole, memberId);
};

// Nicole's behaviour: her skill's shield and team ATK buff, her burst's projections, her ascensions, and her first, second,
// Fourth and sixth constellations. Her strikes, charged attack, plunges, and
// Her skill's and burst's own hits are her record's alone
export const createNicoleKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => {
  const burstProjection = readParameter("burstProjection");
  const skillShieldAtk = readParameter("skillShieldAtk");
  const skillShieldFlat = readParameter("skillShieldFlat");
  const skillBuffRatio = readParameter("skillBuffRatio");
  const skillBuffMax = readParameter("skillBuffMax");

  return {
    burst: {
      // Her burst clears any status it left, and starts its own one frame after its hit, which then counts its projections
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        removeKitEffects(kitEffectState, (effect) => effect.kind === "status" && effect.id === BURST_STATUS_ID);
        scheduleKitTask(kitEffectState, combatant.characterId, toKitSeconds(BURST_STATUS_FRAMES), (tick) => {
          addKitStatus(tick.kitEffectState, combatant.characterId, {
            id: BURST_STATUS_ID,
            secondsRemaining: BURST_SECONDS,
            stacks: 0,
          });
        });
      },
    },
    // Her fourth constellation's flat damage, on her own strikes and on the strikes of the member she is deployed with
    getPartyStrikeBonus: (member, strike, _enemy, _party, effects) => ({
      additiveBaseDamageBonus:
        getC4Stacks(effects, strike.combatant.characterId, strike.attackTag) > 0
          ? CONSTELLATION_4_RATIO * member.attributes.attack
          : 0,
      defenseIgnored: getC6DefenceIgnored(member.constellationCount, strike.combatant, effects),
    }),
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, _party, effects) =>
      getC4Stacks(effects, strike.combatant.characterId, strike.attackTag) > 0
        ? CONSTELLATION_4_RATIO * strike.combatant.attributes.attack
        : 0,
    getStrikeDefenceIgnored: (strike, _enemy, _party, effects) =>
      getC6DefenceIgnored(strike.combatant.constellationCount, strike.combatant, effects),
    // Her burst projects a copy of the active character's hit onto the enemy it struck, as gcsim's OnEnemyHit hook
    // Does, at most four times and once each 3 seconds
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.EnemyHit) takeC4Stack(context.kitEffectState.effects, event);
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (combatant.ascension < ASCENSION_1) return;
        const { characterId, previousCharacterId } = event;
        if (combatant.constellationCount < CONSTELLATION_6 && previousCharacterId !== undefined)
          removeKitEffects(
            context.kitEffectState,
            (effect) =>
              effect.kind === "buff" &&
              effect.characterId === previousCharacterId &&
              effect.source === ASCENSION_1_SOURCE,
          );
        // A swap made before the last one's upgrade lands is replaced by this swap's task, as gcsim's a1Src token does
        scheduleKitTask(
          context.kitEffectState,
          combatant.characterId,
          checkIsKitHexerei(characterId) ? 0 : ASCENSION_1_SWAP_SECONDS,
          (tick) => {
            upgradeAscensionBuff(tick, combatant, characterId);
          },
          { id: ASCENSION_1_SWAP_ID },
        );
        return;
      }
      if (event.kind !== KitEventKind.EnemyHit || event.striker.characterId !== context.activeCombatant.characterId)
        return;
      // Her fourth ascension upgrades her own buff on each elemental hit of the active character, as gcsim's a4Init does
      if (combatant.ascension >= ASCENSION_4 && event.element !== undefined)
        upgradeAscensionBuff(
          context,
          combatant,
          combatant.characterId,
          combatant.constellationCount >= CONSTELLATION_6 ? Infinity : ASCENSION_4_SECONDS,
        );
      // Her first constellation projects each hit of the active character on a cooldown of its own, with no burst's status needed
      if (
        combatant.constellationCount >= CONSTELLATION_1 &&
        startKitCooldown(
          context.kitEffectState,
          combatant.characterId,
          CONSTELLATION_1_ICD_ID,
          CONSTELLATION_1_ICD_SECONDS,
        )
      )
        scheduleProjection(
          context.kitEffectState,
          combatant,
          event,
          CONSTELLATION_1_MULTIPLIER,
          CONSTELLATION_1_HITBOX,
        );
      const burst = findKitStatus(context.kitEffectState.effects, combatant.characterId, BURST_STATUS_ID);
      if (!burst || burst.secondsRemaining <= 0 || (burst.stacks ?? 0) >= PROJECTION_LIMIT) return;
      if (!startKitCooldown(context.kitEffectState, combatant.characterId, PROJECTION_ICD_ID, PROJECTION_ICD_SECONDS))
        return;
      burst.stacks = (burst.stacks ?? 0) + 1;
      scheduleProjection(
        context.kitEffectState,
        combatant,
        event,
        burstProjection,
        PROJECTION_HITBOXES.get(event.striker.characterId) ?? DEFAULT_PROJECTION_HITBOX,
      );
    },
    skill: {
      // Revelation: Uncreated Light shields the team with a Pyro shield scaled by her attack, and gives each deployed member an
      // ATK buff scaled by her attack, capped at the skill's maximum
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        // Her skill takes off the buff it gave the team before and every ascension and second-constellation buff, as gcsim's cast does
        removeKitEffects(
          kitEffectState,
          (effect) =>
            effect.kind === "buff" &&
            (effect.source === SKILL_BUFF_SOURCE ||
              effect.source === ASCENSION_1_SOURCE ||
              effect.source === CONSTELLATION_2_SOURCE),
        );
        scheduleKitTask(kitEffectState, combatant.characterId, toKitSeconds(SKILL_SNAPSHOT_FRAMES), (tick) => {
          castKitShield(tick, combatant.characterId, {
            element: Element.Pyro,
            health: skillShieldAtk * combatant.attributes.attack + skillShieldFlat,
            secondsRemaining: SKILL_SECONDS,
          });
          const amount = Math.min(combatant.attributes.attack * skillBuffRatio, skillBuffMax);
          for (const characterId of getDeployedCharacterIds(tick.party)) {
            buffKitMember(tick.kitEffectState, characterId, {
              amount,
              attribute: Attribute.Attack,
              secondsRemaining: SKILL_SECONDS,
              source: SKILL_BUFF_SOURCE,
            });
            if (combatant.constellationCount >= CONSTELLATION_2)
              buffKitMember(tick.kitEffectState, characterId, {
                amount: CONSTELLATION_2_AMOUNT,
                attribute: Attribute.Attack,
                secondsRemaining: SKILL_SECONDS,
                source: CONSTELLATION_2_SOURCE,
              });
          }
        });
      },
    },
  };
};
