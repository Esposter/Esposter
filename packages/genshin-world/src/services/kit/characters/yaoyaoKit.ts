import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { GroundPoint } from "genshin-engine";

import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
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

// Yaoyao's behaviour: her Yuegui, which her skill spawns, throws a White Jade Radish each throw interval at a target the
// Pick above chooses. Each radish's heal goes to the character on the field, its share of Yaoyao's Max HP and a flat amount
// Constellation 1 needs the White Jade Radish explosion as an event, which the kit does not emit
// Constellation 2 needs the Adeptal Legacy state and the radish explosion damage, which the kit does not build
// Constellation 4 needs an Elemental Mastery bonus from 0.3% of her Max HP, which the kit does not build
// Constellation 6 needs the Yuegui throw's Mega Radish every two radishes, which the kit does not build
export const createYaoyaoKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const skillRadish = readHit("skillRadish");
  const skillRadishHealMaxHealthShare = readParameter("skillRadishHealMaxHealthShare");
  const skillRadishFlatHeal = readParameter("skillRadishFlatHeal");
  const yueguiSpawnSeconds = readSeconds("skillCooldownStart") + readSeconds("yueguiSpawnDelay");
  const yueguiFirstThrowSeconds = readSeconds("yueguiFirstThrow");
  const yueguiThrowIntervalSeconds = readSeconds("yueguiThrowInterval");
  const yueguiDurationSeconds = readSeconds("yueguiDuration");

  // Each radish's heal is priced from Yaoyao's Max HP as the radish is thrown
  const throwSkillRadish = (context: KitContext, combatant: Combatant, yueguiCentre: GroundPoint): void => {
    const healing = skillRadishHealMaxHealthShare * combatant.attributes.maxHealth + skillRadishFlatHeal;
    landRadish(context, combatant, pickRadishTarget(context, yueguiCentre), skillRadish, (tick) =>
      changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, healing),
    );
  };

  return {
    // Raphanus Sky Cluster schedules the Yuegui's spawn, two metres ahead of where Yaoyao's body stands when it spawns
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        scheduleKitTask(kitEffectState, combatant.characterId, yueguiSpawnSeconds, (tick) => {
          const yueguiCentre = createAheadBody(tick.body, YUEGUI_SPAWN_METRES).position;
          castKitField(tick.kitEffectState, combatant.characterId, yueguiCentre, {
            nextTickSeconds: yueguiFirstThrowSeconds,
            onTick: (throwContext) => throwSkillRadish(throwContext, combatant, yueguiCentre),
            secondsRemaining: yueguiDurationSeconds,
            tickIntervalSeconds: yueguiThrowIntervalSeconds,
          });
        });
      },
    },
  };
};
