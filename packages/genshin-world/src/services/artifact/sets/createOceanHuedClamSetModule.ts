import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitField } from "#src/models/kit/KitField";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getKitHealedHp } from "#src/services/kit/getKitHealedHp";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";
import { takeOne } from "@esposter/shared";

const OCEAN_HUED_CLAM_COOLDOWN_ID = "oceanHuedClamCooldown";
const OCEAN_HUED_CLAM_FOAM_ID = "oceanHuedClamFoam";

// The Sea-Dyed Foam's hooks on its field, each closing over the HP its wearer's heals have put in it. Its field hears the
// Heal that made it too, as the kits hear it first, and it takes the HP of each heal its wearer gives, up to the maximum, until
// It bursts at its tick, when the share of that HP is dealt as Physical DMG to each standing enemy. Its area is not modelled
const createSeaDyedFoamHooks = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  characterId: number,
  damageShare: number,
  maximumHp: number,
): Pick<KitField, "onEvent" | "onTick"> => {
  let healedHp = 0;
  return {
    onEvent: (event, field) => {
      if (event.kind !== KitEventKind.HealthChanged || event.sourceCharacterId !== characterId || field.tickIndex > 0)
        return;
      healedHp = Math.min(maximumHp, healedHp + getKitHealedHp(event, characterIdCombatantMap));
    },
    onTick: (context) => {
      const owner = context.characterIdCombatantMap.get(characterId);
      for (const enemy of context.enemyMap.values())
        if (![EnemyState.Dead, EnemyState.Return].includes(enemy.state))
          strikeReactionDamage(enemy, Element.Physical, damageShare * healedHp, owner, context);
    },
  };
};

// Ocean-Hued Clam. Its four-piece bonus makes a Sea-Dyed Foam when its wearer heals a party member, which takes the HP that
// Heal restores, overflow and a Bond of Life's share included, from its wearer's heals until it bursts three seconds on, for
// The table's second param of that HP as Physical DMG. One foam can start every 3.5 seconds, and it holds at most the fifth
// Param's HP. The first param is its seconds, the second its DMG share, the third is zero and unread, and the fourth the cooldown
export const createOceanHuedClamSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const foamSeconds = takeOne(bonus.params, 0);
  const damageShare = takeOne(bonus.params, 1);
  const cooldownSeconds = takeOne(bonus.params, 3);
  const maximumHp = takeOne(bonus.params, 4);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { characterIdCombatantMap, kitEffectState } = context;
      if (event.kind !== KitEventKind.HealthChanged || event.sourceCharacterId !== characterId) return;
      if (
        getKitHealedHp(event, characterIdCombatantMap) <= 0 ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, OCEAN_HUED_CLAM_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: OCEAN_HUED_CLAM_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
      castKitField(
        kitEffectState,
        characterId,
        { x: 0, z: 0 },
        {
          id: OCEAN_HUED_CLAM_FOAM_ID,
          nextTickSeconds: foamSeconds,
          secondsRemaining: foamSeconds + SUMMON_LINGER_SECONDS,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
          ...createSeaDyedFoamHooks(characterIdCombatantMap, characterId, damageShare, maximumHp),
        },
      );
    },
  };
};
