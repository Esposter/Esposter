import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

// Measured: gcsim v2.47.2 (MIT) diona/burst.go, Signature Mix's field healing within a circle of radius 7 round it every
// Two seconds from two seconds after the initial hit
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/diona/burst.go
const SIGNATURE_MIX_FIELD_RADIUS = 7;
const SIGNATURE_MIX_TICK_SECONDS = 2;
// Provisional: gcsim's field lasts 750 frames, half a second past the table's 12 seconds, which this adds to it
const SIGNATURE_MIX_FIELD_MARGIN_SECONDS = 0.5;
const SIGNATURE_MIX_FIELD_ID = "diona-signature-mix-field";

// Measured: gcsim v2.47.2 (MIT) diona/skill.go, Icy Paws' shield at 1.15 times its strength from two constellations, which
// Is gcsim's C2. Diona's hold shield is the table's bonus times the tap's shield
const SHIELD_CONSTELLATION = 2;
const SHIELD_CONSTELLATION_MULTIPLIER = 1.15;
// Measured: gcsim v2.47.2 (MIT) diona/cons.go, the first constellation's 15 energy returned as Signature Mix's field ends
const SIGNATURE_MIX_CONSTELLATION = 1;
const SIGNATURE_MIX_CONSTELLATION_ENERGY = 15;

export const DIONA_CHARACTER_ID = 10_000_039;

// Diona's behaviour: Icy Paws' tap casts her shield as it starts, and its hold the shield times the hold's bonus, which
// Constellation 2 raises. Signature Mix casts its field, healing the character on the field, and its ticks, a summon at
// The cast's body; from Constellation 1 she regains energy as the field ends. Her passives and other constellations are
// Not built, as the kit events do not reach them
// Constellation 4 needs the aimed shot's charge time read within Signature Mix's radius, not read by the charged attack
// Constellation 6 needs Signature Mix's field to buff each member inside it by its HP share, not built
export const createDionaKitBehaviour = ({ kit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shieldMaxHealthShare = readParameter("shieldMaxHealthShare");
  const shieldFlatHealth = readParameter("shieldFlatHealth");
  const shieldSeconds = readParameter("shieldSeconds");
  const holdShieldMultiplier = readParameter("holdShieldMultiplier");
  const signatureMixHealMaxHealthShare = readParameter("signatureMixHealMaxHealthShare");
  const signatureMixHealFlatHealth = readParameter("signatureMixHealFlatHealth");
  const signatureMixSeconds = readParameter("signatureMixSeconds") + SIGNATURE_MIX_FIELD_MARGIN_SECONDS;
  const signatureMixTicks = readHits("signatureMixTicks");
  const signatureMixHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  // The shield is a share of her Max HP and a flat amount, times its strength, which Constellation 2 raises by 15%
  const castShield = (kitEffectState: KitEffectState, combatant: Combatant, strengthMultiplier: number): KitShield =>
    castKitShield(kitEffectState, combatant.characterId, {
      element: Element.Cryo,
      health:
        (shieldMaxHealthShare * combatant.attributes.maxHealth + shieldFlatHealth) *
        strengthMultiplier *
        (combatant.constellationCount >= SHIELD_CONSTELLATION ? SHIELD_CONSTELLATION_MULTIPLIER : 1),
      secondsRemaining: shieldSeconds,
    });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castKitField(kitEffectState, combatant.characterId, body.position, {
          id: SIGNATURE_MIX_FIELD_ID,
          nextTickSeconds: signatureMixHitmarkSeconds + SIGNATURE_MIX_TICK_SECONDS,
          onTick: (tick) =>
            changeKitMemberHealth(
              tick,
              combatant,
              tick.activeCombatant.characterId,
              signatureMixHealMaxHealthShare * combatant.attributes.maxHealth + signatureMixHealFlatHealth,
            ),
          radius: SIGNATURE_MIX_FIELD_RADIUS,
          secondsRemaining: signatureMixSeconds,
          tickIntervalSeconds: SIGNATURE_MIX_TICK_SECONDS,
        });
        castKitSummon(kitEffectState, body, combatant, signatureMixTicks, { secondsRemaining: signatureMixSeconds });
      },
    },
    // Constellation 1 returns 15 energy to Diona as her field ends, as the game's text gives it
    onKitEvent: (event, { party }, combatant) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "field" &&
        event.effect.id === SIGNATURE_MIX_FIELD_ID &&
        event.effect.characterId === combatant.characterId &&
        combatant.constellationCount >= SIGNATURE_MIX_CONSTELLATION
      )
        gainPartyMemberEnergy(party, combatant, SIGNATURE_MIX_CONSTELLATION_ENERGY);
    },
    skill: { onStart: ({ activeCombatant: combatant, kitEffectState }) => castShield(kitEffectState, combatant, 1) },
    skillHolds: [
      {
        onStart: ({ activeCombatant: combatant, kitEffectState }) =>
          castShield(kitEffectState, combatant, holdShieldMultiplier),
      },
    ],
  };
};
