import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Element } from "#src/models/Element";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Measured: gcsim v2.47.2 (MIT) thoma/burst.go, thoma.go and shield.go, Fiery Collapse: for the burst's seconds, a normal
// Attack the character on the field starts sets one off from its body, at most once in the table's seconds. The first
// Enemy it strikes gives the team Thoma's shield, its share of his Max HP and its flat HP added to his shield already
// Standing, up to the most Blazing Blessing's shield may hold, for the table's seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/burst.go
const FIERY_COLLAPSE_COOLDOWN_STATUS_ID = "thoma-fiery-collapse-cooldown";
// Flaming Assault, as the dump's Tohma_PermanentSkill_2 row (promote 4) and gcsim v2.47.2 (MIT) thoma/asc.go give it: a
// Fiery Collapse deals 2.2% of Thoma's Max HP more DMG. gcsim gates it at Ascension 1, but the talent table names
// Ascension 4, so the table's phase stands
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/thoma/asc.go
const FLAMING_ASSAULT_ASCENSION = 4;
const FLAMING_ASSAULT_MAX_HEALTH_SHARE = 0.022;

export const THOMA_CHARACTER_ID = 10_000_050;

// Thoma's behaviour: Blazing Blessing sets its shield as it starts and infuses his own attacks with Pyro, and Crimson
// Ooyoroi stands for its seconds, setting off a Fiery Collapse from each normal attack the character on the field starts,
// At most once in the table's seconds, whose first strike stacks Thoma's shield up to the most Blazing Blessing's may
// Hold. From Ascension 4 a Fiery Collapse adds a share of his Max HP to its DMG. His Ascension 1 passive and his
// Constellations are not built yet
export const createThomaKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const blazingBlessingShieldMaxHealthShare = readParameter("blazingBlessingShieldMaxHealthShare");
  const blazingBlessingShieldFlatHealth = readParameter("blazingBlessingShieldFlatHealth");
  const blazingBlessingShieldSeconds = readParameter("blazingBlessingShieldSeconds");
  const blazingBlessingInfusionSeconds = readSeconds("blazingBlessingInfusion");
  const maxShieldMaxHealthShare = readParameter("blazingBlessingMaxShieldMaxHealthShare");
  const maxShieldFlatHealth = readParameter("blazingBlessingMaxShieldFlatHealth");
  const fieryCollapse = readHit("fieryCollapse");
  const fieryCollapseShieldMaxHealthShare = readParameter("fieryCollapseShieldMaxHealthShare");
  const fieryCollapseShieldFlatHealth = readParameter("fieryCollapseShieldFlatHealth");
  const fieryCollapseShieldSeconds = readParameter("fieryCollapseShieldSeconds");
  const fieryCollapseIntervalSeconds = readParameter("fieryCollapseIntervalSeconds");
  const ooyoroiSeconds = readParameter("crimsonOoyoroiSeconds");
  // A Fiery Collapse's hit, whose first strike stacks Thoma's shield, since a collapse shields the team once
  const createFieryCollapseHit = (): KitHit => {
    let isShielded = false;
    return {
      ...fieryCollapse,
      additiveBaseDamageBonus: (striker) =>
        striker.ascension >= FLAMING_ASSAULT_ASCENSION
          ? FLAMING_ASSAULT_MAX_HEALTH_SHARE * striker.attributes.maxHealth
          : 0,
      onStrike: ({ kitEffectState }, { combatant: { attributes, characterId } }) => {
        if (isShielded) return;
        isShielded = true;
        const standingHealth =
          kitEffectState.effects.find(
            (effect): effect is KitShield =>
              checkIsKitShieldLive(effect) && !effect.isCrystallize && effect.characterId === characterId,
          )?.health ?? 0;
        const maxHealth = maxShieldMaxHealthShare * attributes.maxHealth + maxShieldFlatHealth;
        castKitShield(kitEffectState, characterId, {
          element: Element.Pyro,
          health: Math.min(
            standingHealth + fieryCollapseShieldMaxHealthShare * attributes.maxHealth + fieryCollapseShieldFlatHealth,
            maxHealth,
          ),
          secondsRemaining: fieryCollapseShieldSeconds,
        });
      },
    };
  };
  // Sets off a Fiery Collapse from the body on the field, priced by Thoma as he cast the burst, unless one was set off
  // Within the table's seconds
  const setOffFieryCollapse = (ooyoroi: KitSummon, { body, kitEffectState }: KitContext): void => {
    const { combatant } = ooyoroi;
    if (
      !startKitCooldown(
        kitEffectState,
        combatant.characterId,
        FIERY_COLLAPSE_COOLDOWN_STATUS_ID,
        fieryCollapseIntervalSeconds,
      )
    )
      return;
    castKitSummon(kitEffectState, body, combatant, [createFieryCollapseHit()]);
  };
  return {
    // The burst stands the Ooyoroi for its seconds, which the normal attacks of the character on the field set off
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const ooyoroi = castKitSummon(kitEffectState, body, combatant, [], {
          onNormalAttackStart: (context) => setOffFieryCollapse(ooyoroi, context),
          secondsRemaining: ooyoroiSeconds,
        });
      },
    },
    // Blazing Blessing sets its shield as it starts, from Thoma's Max HP and the table's share and flat HP, for its
    // Seconds. It also infuses his own attacks with Pyro for the infusion's seconds
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        castKitShield(kitEffectState, combatant.characterId, {
          element: Element.Pyro,
          health:
            blazingBlessingShieldMaxHealthShare * combatant.attributes.maxHealth + blazingBlessingShieldFlatHealth,
          secondsRemaining: blazingBlessingShieldSeconds,
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Pyro,
          kind: "infusion",
          secondsRemaining: blazingBlessingInfusionSeconds,
        });
      },
    },
  };
};
