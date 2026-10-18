import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { GroundPoint } from "genshin-engine";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { changeKitTeamHealth } from "#src/services/kit/effects/changeKitTeamHealth";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { selectRandomKitEnemy } from "#src/services/kit/selectRandomKitEnemy";
import { getPartyMember } from "#src/services/party/getPartyMember";

export const YAOYAO_CHARACTER_ID = 10_000_077;

// Measured: gcsim (MIT) yaoyao/yuegui.go, a Yuegui throws at a random enemy within 8 metres of itself while its wielder's
// HP is above 70% of her Max HP, and at her own position otherwise
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/yuegui.go
const YUEGUI_TARGET_RADIUS_METRES = 8;
const YUEGUI_HEALTH_SHARE_THRESHOLD = 0.7;
// Measured: gcsim (MIT) yaoyao/skill.go, the Yuegui spawns two metres ahead of her body
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/skill.go
const YUEGUI_SPAWN_METRES = 2;
// Measured: gcsim (MIT) yaoyao/burst.go, Moonjade Descent's Yuegui spawn behind her, two metres back from her body
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/yaoyao/burst.go
const JUMPING_YUEGUI_METRES = 2;
const BURST_STATUS_ID = "yaoyao-burst";
const JUMPING_YUEGUI_ID = "yaoyao-jumping-yuegui";

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

// A Yuegui throws a radish at its target, and the radish's heal is priced from the thrower's Max HP as it is thrown
const throwRadish = (
  context: KitContext,
  combatant: Combatant,
  yueguiCentre: GroundPoint,
  hit: KitHit,
  { flat, healsTeam, maxHealthShare }: RadishHeal,
): void => {
  const healing = maxHealthShare * combatant.attributes.maxHealth + flat;
  landRadish(context, combatant, pickRadishTarget(context, yueguiCentre), hit, (tick) => {
    if (healsTeam) changeKitTeamHealth(tick, combatant, healing);
    else changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, healing);
  });
};

// Yaoyao's behaviour: her Yuegui, which her skill spawns, throws a White Jade Radish each throw interval at a target the
// Pick above chooses. Her burst spawns three Yuegui behind her while it lasts, whose radishes heal the whole team, and a
// Swap ends the burst and the Yuegui it spawned
// Constellation 1 needs the White Jade Radish explosion as an event, which the kit does not emit
// Constellation 2 needs the Adeptal Legacy state and the radish explosion damage, which the kit does not build
// Constellation 4 needs an Elemental Mastery bonus from 0.3% of her Max HP, which the kit does not build
// Constellation 6 needs the Yuegui throw's Mega Radish every two radishes, which the kit does not build
export const createYaoyaoKitBehaviour = ({
  readHit,
  readParameter,
  readSecondsList,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillRadish = readHit("skillRadish");
  const skillRadishHeal: RadishHeal = {
    flat: readParameter("skillRadishFlatHeal"),
    healsTeam: false,
    maxHealthShare: readParameter("skillRadishHealMaxHealthShare"),
  };
  const yueguiSpawnSeconds = readSeconds("skillCooldownStart") + readSeconds("yueguiSpawnDelay");
  const yueguiFirstThrowSeconds = readSeconds("yueguiFirstThrow");
  const yueguiThrowIntervalSeconds = readSeconds("yueguiThrowInterval");
  const yueguiDurationSeconds = readSeconds("yueguiDuration");
  const burstRadish = readHit("burstRadish");
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
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const { characterId } = combatant;
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
              onTick: (throwContext) =>
                throwRadish(throwContext, combatant, yueguiCentre, burstRadish, burstRadishHeal),
              secondsRemaining: burst.secondsRemaining,
              tickIntervalSeconds: yueguiThrowIntervalSeconds,
            });
          });
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
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        scheduleKitTask(kitEffectState, combatant.characterId, yueguiSpawnSeconds, (tick) => {
          const yueguiCentre = createAheadBody(tick.body, YUEGUI_SPAWN_METRES).position;
          castKitField(tick.kitEffectState, combatant.characterId, yueguiCentre, {
            nextTickSeconds: yueguiFirstThrowSeconds,
            onTick: (throwContext) => throwRadish(throwContext, combatant, yueguiCentre, skillRadish, skillRadishHeal),
            secondsRemaining: yueguiDurationSeconds,
            tickIntervalSeconds: yueguiThrowIntervalSeconds,
          });
        });
      },
    },
  };
};
