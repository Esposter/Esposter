import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { OCEAN_HUED_CLAM_FOAM_ID } from "#src/services/artifact/constants";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHealedHp } from "#src/services/kit/getKitHealedHp";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";
import { takeOne } from "@esposter/shared";

const OCEAN_HUED_CLAM_COOLDOWN_ID = "oceanHuedClamCooldown";
// The status a wearer's heals gather on while no foam takes them, which the next foam takes and its burst empties
const OCEAN_HUED_CLAM_GATHERED_HP_ID = "oceanHuedClamGatheredHp";
// The radius about the active character that the foam's burst reaches, as gcsim draws the burst about the player
const OCEAN_HUED_CLAM_FOAM_RADIUS = 6;

const getGatheredHp = (kitEffectState: KitEffectState, characterId: number): number =>
  findKitStatus(kitEffectState.effects, characterId, OCEAN_HUED_CLAM_GATHERED_HP_ID)?.stacks ?? 0;

const setGatheredHp = (kitEffectState: KitEffectState, characterId: number, gatheredHp: number): void => {
  addKitStatus(kitEffectState, characterId, {
    id: OCEAN_HUED_CLAM_GATHERED_HP_ID,
    secondsRemaining: Number.POSITIVE_INFINITY,
    stacks: gatheredHp,
  });
};

const findSeaDyedFoam = (effects: readonly KitEffect[]): KitField | undefined =>
  effects.find((effect): effect is KitField => effect.kind === "field" && effect.id === OCEAN_HUED_CLAM_FOAM_ID);

// The foam's burst, which deals the share of the HP gathered on its wearer as Physical DMG to each standing enemy
// Within its radius of the active character as it pops, and empties the gathered HP
const createSeaDyedFoamBurst =
  (characterId: number, damageShare: number) =>
  (context: KitContext): void => {
    const gatheredHp = getGatheredHp(context.kitEffectState, characterId);
    setGatheredHp(context.kitEffectState, characterId, 0);
    const owner = context.characterIdCombatantMap.get(characterId);
    for (const enemy of context.enemyMap.values())
      if (
        ![EnemyState.Dead, EnemyState.Return].includes(enemy.state) &&
        checkIsInKitField({ centre: context.body.position, radius: OCEAN_HUED_CLAM_FOAM_RADIUS }, enemy.position)
      )
        strikeReactionDamage(enemy, undefined, damageShare * gatheredHp, owner, context);
  };

// Ocean-Hued Clam. Its four-piece bonus makes a Sea-Dyed Foam when its wearer heals a party member, which bursts three
// Seconds on for the table's second param of the HP its wearer's heals gathered, as Physical DMG to the enemies within
// Six of the active character as the foam pops. The heal the wearer gives while no foam stands gathers too, and the
// Next foam takes it, as gcsim's accumulation does. One foam stands at a time, so another wearer's heal gathers for
// Nobody while it does. One foam can start every 3.5 seconds, and it holds at most the fifth param's HP. The first
// Param is its seconds, the second its DMG share, the third is zero and unread, and the fourth the cooldown
export const createOceanHuedClamSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const foamSeconds = takeOne(bonus.params, 0);
  const damageShare = takeOne(bonus.params, 1);
  const cooldownSeconds = takeOne(bonus.params, 3);
  const maximumHp = takeOne(bonus.params, 4);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { body, characterIdCombatantMap, kitEffectState, party } = context;
      if (event.kind !== KitEventKind.HealthChanged || event.sourceCharacterId !== characterId) return;
      const healedHp = getKitHealedHp(event, kitEffectState.effects, party, characterIdCombatantMap);
      if (healedHp <= 0) return;
      const foam = findSeaDyedFoam(kitEffectState.effects);
      if (foam && foam.characterId !== characterId) return;
      setGatheredHp(
        kitEffectState,
        characterId,
        Math.min(maximumHp, getGatheredHp(kitEffectState, characterId) + healedHp),
      );
      if (foam || !startKitCooldown(kitEffectState, characterId, OCEAN_HUED_CLAM_COOLDOWN_ID, cooldownSeconds)) return;
      castKitField(kitEffectState, characterId, body.position, {
        id: OCEAN_HUED_CLAM_FOAM_ID,
        nextTickSeconds: foamSeconds,
        onTick: createSeaDyedFoamBurst(characterId, damageShare),
        secondsRemaining: foamSeconds + SUMMON_LINGER_SECONDS,
        tickIntervalSeconds: Number.POSITIVE_INFINITY,
      });
    },
  };
};
