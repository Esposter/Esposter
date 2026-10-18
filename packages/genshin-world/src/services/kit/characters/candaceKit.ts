import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitShield } from "#src/models/kit/KitShield";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { MELEE_WEAPON_TYPES } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { completeKitSkillCharge } from "#src/services/kit/effects/completeKitSkillCharge";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { takeOne } from "@esposter/shared";

// The Prayer's infusion lasts 60 frames, as gcsim's AddWeaponInfuse gives it
const INFUSION_SECONDS = 1;
const PRAYER_FIELD_ID = "candace-prayer";
const WAVES_STATUS_ID = "candace-waves";

// Measured: gcsim (MIT) candace/cons.go, Constellation 1 lengthens the Prayer to 12 seconds, three past the table's nine, and
// Constellation 6 sets a wave off on each elemental normal attack a party member lands, once every 2.3 seconds. The table
// Gives both, and the 2.3 seconds read the same from its constellation row
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_PRAYER_EXTRA_SECONDS = 3;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_COOLDOWN_SECONDS = 2.3;
const CONSTELLATION_6_STATUS_ID = "candace-constellation-6";

// Whether the Prayer of the Crimson Crown field stands on a character, the field the burst sets going
const findPrayerField = (effects: readonly KitEffect[], characterId: number): KitField | undefined =>
  effects.find(
    (effect): effect is KitField =>
      effect.kind === "field" && effect.characterId === characterId && effect.id === PRAYER_FIELD_ID,
  );

// The Prayer's infusion on a party member with a sword, claymore or polearm, as its field's tick and a swap give it
const infuse = (kitEffectState: KitEffectState, { characterId, weaponType }: Combatant): void => {
  if (weaponType === undefined || !MELEE_WEAPON_TYPES.has(weaponType)) return;
  addKitEffect(kitEffectState, {
    characterId,
    element: Element.Hydro,
    kind: "infusion",
    secondsRemaining: INFUSION_SECONDS,
  });
};

export const CANDACE_CHARACTER_ID = 10_000_072;
const ASCENSION_1 = 1;

// An enemy's strike on a character: its HP lost with no kit as the source, or a shield on it absorbing a strike. A drown
// Reads the same as the HP loss, as the record gives it no cause
const checkIsStrikeOn = (event: KitEvent, characterId: number): boolean =>
  (event.kind === KitEventKind.HealthChanged &&
    event.characterId === characterId &&
    event.healthShare < 0 &&
    event.sourceCharacterId === undefined) ||
  (event.kind === KitEventKind.ShieldAbsorbed && event.struckCharacterId === characterId);

// Candace's behaviour: Sacred Rite: Heron's Sanctum's tap and charged hold each cast her shield until their hit lands, and
// Sacred Rite: Wagtail's Tide sets its Prayer of the Crimson Crown going at its hitmark, infusing the character on the
// Field, and on each swap while it holds infuses the one coming on and sets a wave off round the body. Constellations 1
// And 6 are built, the sixth's wave on a party member's elemental normal attack. Not built: Ascension 1's instant finish
// Of a charge on a hit taken, which gcsim itself leaves to a TODO; Ascension 4's DMG and the Prayer's 20% DMG Bonus on the
// Team's normal attacks, as no hook reads another member's normal attack's DMG; Constellation 2's Max HP, as a buff on Max
// HP is not read back into maxHealth; Constellation 4's shorter hold cooldown, as a hold's cooldown is one number on the
// Kit; and the talent levels of Constellations 3 and 5, which no kit reads yet
export const createCandaceKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const burstSeconds = readParameter("prayerOfTheCrimsonCrownSeconds");
  const wavesMax = readParameter("maxWaveCount");
  const shieldShare = readParameter("shieldMaxHealthShare");
  const shieldFlat = readParameter("shieldFlatHealth");
  const prayerTickSeconds = readSeconds("prayerTick");
  const tapHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const chargedHitmarkSeconds = takeOne(takeOne(kit.elementalSkillHolds ?? []).action.hits).hitmarkSeconds;
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const wave = readHit("wave");
  const constellation6Wave = readHit("theOverflowWave");

  // The shield is the one Candace casts onto the team, for the seconds until its hit lands, as gcsim sets its shield to
  // Expire at the hitmark
  const castShield = (kitEffectState: KitEffectState, combatant: Combatant, secondsRemaining: number): KitShield =>
    castKitShield(kitEffectState, combatant.characterId, {
      element: Element.Hydro,
      health: shieldFlat + shieldShare * combatant.attributes.maxHealth,
      secondsRemaining,
    });

  return {
    // The Prayer's field infuses the character on the field each tick, from the hitmark, and the wave count is a status,
    // Restarted by each burst
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId, constellationCount } = combatant;
        const prayerSeconds =
          burstHitmarkSeconds +
          burstSeconds +
          (constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_PRAYER_EXTRA_SECONDS : 0);
        // A recast burst ends the Prayer it finds standing, as gcsim restarts its status
        const standingPrayer = findPrayerField(kitEffectState.effects, characterId);
        if (standingPrayer) standingPrayer.secondsRemaining = 0;
        castKitField(kitEffectState, characterId, body.position, {
          id: PRAYER_FIELD_ID,
          nextTickSeconds: burstHitmarkSeconds,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }) => infuse(tickEffectState, activeCombatant),
          secondsRemaining: prayerSeconds,
          tickIntervalSeconds: prayerTickSeconds,
        });
        addKitStatus(kitEffectState, characterId, { id: WAVES_STATUS_ID, secondsRemaining: prayerSeconds, stacks: 0 });
      },
    },
    // Each swap while the Prayer stands infuses the one coming on and sets a wave off round the body, up to the waves'
    // Count. Constellation 6 sets a wave off when a party member's elemental normal attack strikes an enemy, once per
    // Cooldown
    onKitEvent: (event, { activeCombatant, body, characterIdCombatantMap, kitEffectState }, combatant) => {
      const { ascension, characterId, constellationCount } = combatant;
      const { effects } = kitEffectState;
      // Ascension 1: a strike on her while she holds her skill completes its charge, so its release plays the charged hold
      if (ascension >= ASCENSION_1 && checkIsStrikeOn(event, characterId))
        completeKitSkillCharge(kitEffectState, characterId);
      if (!findPrayerField(effects, characterId)) return;
      if (event.kind === KitEventKind.CharacterSwapped) {
        const incoming = characterIdCombatantMap.get(event.characterId);
        if (incoming) infuse(kitEffectState, incoming);
        const waves = findKitStatus(effects, characterId, WAVES_STATUS_ID);
        if (!waves || (waves.stacks ?? 0) >= wavesMax) return;
        addKitStatus(kitEffectState, characterId, {
          id: WAVES_STATUS_ID,
          secondsRemaining: waves.secondsRemaining,
          stacks: (waves.stacks ?? 0) + 1,
        });
        castKitSummon(kitEffectState, body, combatant, [wave]);
        return;
      }
      if (
        event.kind === KitEventKind.DamageTaken &&
        constellationCount >= CONSTELLATION_6 &&
        event.attackTag === AttackTag.NormalAttack &&
        event.striker.characterId !== characterId &&
        event.striker.characterId === activeCombatant.characterId &&
        getKitHitElement(event.hit, event.striker) !== undefined &&
        startKitCooldown(kitEffectState, characterId, CONSTELLATION_6_STATUS_ID, CONSTELLATION_6_COOLDOWN_SECONDS)
      )
        castKitSummon(kitEffectState, body, combatant, [constellation6Wave]);
    },
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        castShield(kitEffectState, combatant, tapHitmarkSeconds),
    },
    skillHolds: [
      {
        onStart: ({ activeCombatant: combatant, kitEffectState }) =>
          castShield(kitEffectState, combatant, chargedHitmarkSeconds),
      },
    ],
  };
};
