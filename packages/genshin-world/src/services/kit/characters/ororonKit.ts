import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Dark Voices' Echo's field of radius 6.5 round where it was cast, as gcsim (MIT, main) ororon/burst.go gives it. From
// Constellation 4 its soundwaves tick on the interval gcsim's c4BurstInterval gives
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/burst.go
const FIELD_RADIUS = 6.5;
const CONSTELLATION_4 = 4;

// Measured: gcsim (MIT, main) ororon/cons.go, Constellation 2's 8% Electro DMG Bonus for each enemy a burst's ritual or
// Soundwave hits, up to 32%, for the burst's nine seconds from its cast. It is refreshed by the burst, not extended by a hit
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_STACK = 0.08;
const CONSTELLATION_2_MAXIMUM = 0.32;
const CONSTELLATION_2_SOURCE = "ororon-c2";

// Measured: gcsim (MIT, main) ororon/asc.go, Ascension 4's energy: each normal attack, charged attack or plunge of the
// Active character that hits an enemy while the Spirit Orb's hit has set it going gives 3 energy to the active character and
// To Ororon, up to three times, with a second between them. The orb's hit sets it going for 15 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_ENERGY = 3;
const ASCENSION_4_MAXIMUM_TRIGGERS = 3;
const ASCENSION_4_SECONDS = 15;
const ASCENSION_4_INTERNAL_COOLDOWN_SECONDS = 1;
const ASCENSION_4_STATUS_ID = "ororon-a4";
const ASCENSION_4_COOLDOWN_STATUS_ID = "ororon-a4-icd";

export const ORORON_CHARACTER_ID = 10_000_105;

const addConstellation2Stack = ({ kitEffectState }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < CONSTELLATION_2) return;
  const earlier = kitEffectState.effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" &&
      effect.characterId === combatant.characterId &&
      effect.source === CONSTELLATION_2_SOURCE,
  );
  if (earlier === undefined) return;
  addKitEffect(kitEffectState, {
    ...earlier,
    amount: Math.min(earlier.amount + CONSTELLATION_2_STACK, CONSTELLATION_2_MAXIMUM),
  });
};
const onKitEvent = (
  event: KitEvent,
  { activeCombatant, kitEffectState, party }: KitContext,
  combatant: Combatant,
): void => {
  if (event.kind !== KitEventKind.DamageTaken || combatant.ascension < ASCENSION_4) return;
  const { attackTag, striker } = event;
  if (striker.characterId !== activeCombatant.characterId) return;
  if (
    attackTag !== AttackTag.NormalAttack &&
    attackTag !== AttackTag.ChargedAttack &&
    attackTag !== AttackTag.PlungingAttack
  )
    return;
  const status = findKitStatus(kitEffectState.effects, combatant.characterId, ASCENSION_4_STATUS_ID);
  if (
    status === undefined ||
    !startKitCooldown(
      kitEffectState,
      combatant.characterId,
      ASCENSION_4_COOLDOWN_STATUS_ID,
      ASCENSION_4_INTERNAL_COOLDOWN_SECONDS,
    )
  )
    return;
  gainPartyMemberEnergy(party, activeCombatant, ASCENSION_4_ENERGY);
  if (activeCombatant.characterId !== combatant.characterId)
    gainPartyMemberEnergy(party, combatant, ASCENSION_4_ENERGY);
  const triggers = (status.stacks ?? 0) + 1;
  if (triggers < ASCENSION_4_MAXIMUM_TRIGGERS) addKitEffect(kitEffectState, { ...status, stacks: triggers });
  else removeKitEffects(kitEffectState, (effect) => effect === status);
};
// Ororon's behaviour: Dark Voices' Echo casts its soundwave field where he stands, each tick a summon landing the
// Soundwave from where it was cast. Constellations 2 and 4 and Ascension 4 are built. The Spirit Orb's bounce, Ascension 1
// And Constellations 1 and 6 wait on Hypersense and a chained hit, and Constellation 4's Energy restore on the ritual's hit
// Constellation 1 needs the Spirit Orb's extra bounces and Nighttide, which wait on a chained hit and Hypersense
// Constellation 6 needs the ATK stacks after Hypersense, which wait on Hypersense and a chained hit
export const createOroronKitBehaviour = ({ readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const soundwave = readHit("soundwave", { onStrike: addConstellation2Stack });
  const darkVoicesEchoSeconds = readParameter("darkVoicesEchoSeconds");
  const soundwaveTickSeconds = readSeconds("soundwaveTick");
  const constellation4SoundwaveTickSeconds = readSeconds("constellation4SoundwaveTick");
  return {
    // Constellation 2's bonus starts with the burst, and the ritual's hit and each soundwave's raise it
    burst: {
      hits: [{ onStrike: addConstellation2Stack }],
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        if (combatant.constellationCount >= CONSTELLATION_2)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: CONSTELLATION_2_STACK,
            attribute: Attribute.ElectroDamageBonus,
            secondsRemaining: darkVoicesEchoSeconds,
            source: CONSTELLATION_2_SOURCE,
          });
        const tickSeconds =
          combatant.constellationCount >= CONSTELLATION_4 ? constellation4SoundwaveTickSeconds : soundwaveTickSeconds;
        const field = castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: tickSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, { facing, height, position: field.centre }, combatant, [soundwave]);
          },
          radius: FIELD_RADIUS,
          secondsRemaining: darkVoicesEchoSeconds,
          tickIntervalSeconds: tickSeconds,
        });
      },
    },
    onKitEvent,
    // The Spirit Orb's hit sets Ascension 4's energy going
    skill: {
      hits: [
        {
          onStrike: ({ kitEffectState }, { combatant }) => {
            if (combatant.ascension < ASCENSION_4) return;
            addKitStatus(kitEffectState, combatant.characterId, {
              id: ASCENSION_4_STATUS_ID,
              secondsRemaining: ASCENSION_4_SECONDS,
              stacks: 0,
            });
          },
        },
      ],
    },
  };
};
