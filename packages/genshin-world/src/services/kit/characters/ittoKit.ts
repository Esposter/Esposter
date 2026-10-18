import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitTaunt } from "#src/services/kit/effects/castKitTaunt";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

// The Arataki Kesagiri drains no stamina, as gcsim v2.47.2 (MIT) itto/charge.go's ActionStam gives none while Itto holds
// Superlative Superstrength
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/charge.go
const ARATAKI_KESAGIRI_STAMINA = 0;

// Superlative Superstrength's cap of 5 stacks, held until a slash spends them, and the stacks a normal attack gives as it
// Lands, as gcsim v2.47.2 (MIT) itto/itto.go and attack.go assume it hits: 1 for the second strike and 2 for the fourth,
// And under the burst 1 more for the first and the third
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/attack.go
const SUPERSTRENGTH_RESOURCE_ID = "itto-superlative-superstrength";
const SUPERSTRENGTH_MAX_STACKS = 5;
const NORMAL_ATTACK_SUPERSTRENGTH_STACKS = [0, 1, 0, 2];
const RAGING_ONI_KING_SUPERSTRENGTH_STACKS = [1, 0, 1, 0];

// Ushi gives a stack of Superlative Superstrength the first time its hit strikes, one as it takes an enemy's strike, at
// Most once every 2 seconds, and another as it leaves, its seconds run out or its health spent, as gcsim v2.47.2 (MIT)
// Itto/skill.go and ushi.go give it. Ushi flees as it leaves and deals no damage, so the taunt carries no explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/skill.go
const USHI_STRUCK_STATUS_ID = "itto-ushi-struck";
const USHI_DAMAGED_COOLDOWN_STATUS_ID = "itto-ushi-damaged-cooldown";
const USHI_DAMAGED_COOLDOWN_SECONDS = 2;

// Bloodline of the Crimson Oni, as gcsim v2.47.2 (MIT) itto/asc.go gives it: from Ascension 4, each Arataki Kesagiri hit
// Adds 35% of Itto's DEF to its DMG
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/asc.go
const ASCENSION_4 = 4;
const BLOODLINE_DEFENSE_SHARE = 0.35;
// Royal Descent's 0.1 Normal ATK SPD, as gcsim v2.47.2 (MIT) itto/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/burst.go
const BURST_NORMAL_ATTACK_SPEED_BONUS = 0.1;

// Bloodline of the Crimson Oni: each slash of the Arataki Kesagiri adds its DEF share, from Ascension 4
const addBloodlineDamage = (striker: Combatant): number =>
  striker.ascension < ASCENSION_4 ? 0 : BLOODLINE_DEFENSE_SHARE * striker.attributes.defense;

// Whether Itto is the Raging Oni King: his burst's Geo conversion is on him
const checkIsRagingOniKing = (effects: readonly KitEffect[], characterId: number): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "infusion" &&
      effect.characterId === characterId &&
      effect.element === Element.Geo &&
      effect.isConverted === true,
  );

export const ITTO_CHARACTER_ID = 10_000_057;

// Itto's behaviour: his normal attacks and Ushi give him Superlative Superstrength, whose stacks turn his charged attack
// Into the Arataki Kesagiri. Masatsu Zetsugi throws Ushi, a taunt holding a share of his Max HP, and Royal Descent adds
// His ATK per DEF with a Geo conversion carrying its Normal ATK SPD, both ending as he leaves the field. Bloodline of the
// Crimson Oni is built; Arataki Ichiban's ATK SPD, which no attribute holds, and his constellations are not
export const createIttoKitBehaviour = ({
  kit,
  readActions,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillHitmarkSeconds = takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  const ushiHealthShare = readParameter("ushiHealthShare");
  const ushiSeconds = readParameter("ushiSeconds");
  const royalDescentDefenseShare = readParameter("royalDescentDefenseShare");
  const royalDescentSeconds = readSeconds("royalDescent");
  // The Arataki Kesagiri a charged attack plays at each count of stacks, one slash a stack. It spends the stacks as it
  // Starts, and its stance lasts as long as it plays, so its slashes stay its charged attack's to the last. Each start
  // Reads its own seconds, which one behaviour given every action of the list cannot
  const kesagiris = readActions("kesagiris");
  for (const kesagiri of kesagiris) {
    for (const hit of kesagiri.hits) hit.additiveBaseDamageBonus = addBloodlineDamage;
    kesagiri.onStart = ({ activeCombatant: combatant, kitEffectState }) => {
      const stance = findKitStance(kitEffectState.effects, combatant.characterId);
      if (stance) stance.secondsRemaining = kesagiri.seconds;
      spendKitResource(kitEffectState, combatant.characterId, SUPERSTRENGTH_RESOURCE_ID);
    };
  }
  // Itto's stance while he holds stacks, whose charged attack is the Arataki Kesagiri for them at no stamina, held
  // Until a charged attack starts it. The Arataki Kesagiri slashes are Charged Attack DMG, gcsim's AttackTagExtra in
  // Itto/charge.go's ChargeAttack
  const addKesagiriStance = (kitEffectState: KitEffectState, combatant: Combatant, stacks: number): void =>
    enterKitStance(
      kitEffectState,
      combatant,
      {
        chargedAttack: kesagiris[stacks - 1] ?? kit.chargedAttack,
        chargedAttackStamina: ARATAKI_KESAGIRI_STAMINA,
        elementalBurst: kit.elementalBurst,
        elementalSkill: kit.elementalSkill,
        normalAttacks: kit.normalAttacks,
      },
      Number.POSITIVE_INFINITY,
    );
  // Adds stacks of Superlative Superstrength, up to 5, and readies the Arataki Kesagiri for them, unless one is
  // Playing, whose end readies it
  const gainSuperstrength = (kitEffectState: KitEffectState, combatant: Combatant, gained: number): void => {
    if (gained === 0) return;
    const { characterId } = combatant;
    const stacks = gainKitResource(
      kitEffectState,
      characterId,
      SUPERSTRENGTH_RESOURCE_ID,
      gained,
      SUPERSTRENGTH_MAX_STACKS,
    );
    const stance = findKitStance(kitEffectState.effects, characterId);
    if (stance === undefined || stance.secondsRemaining === Number.POSITIVE_INFINITY)
      addKesagiriStance(kitEffectState, combatant, stacks);
  };
  return {
    // Royal Descent deals no damage. It adds Itto's ATK per DEF to his attacks, and infuses them with Geo as they are
    // Converted, with the burst's Normal ATK SPD, for its seconds from the cast or until he leaves the field, as gcsim's
    // Exit deletes the burst's ATK and ATK SPD
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: royalDescentDefenseShare * combatant.attributes.defense,
          attribute: Attribute.Attack,
          isEndedOnSwap: true,
          secondsRemaining: royalDescentSeconds,
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Geo,
          isConverted: true,
          isEndedOnSwap: true,
          kind: "infusion",
          normalAttackSpeedBonus: BURST_NORMAL_ATTACK_SPEED_BONUS,
          secondsRemaining: royalDescentSeconds,
        });
      },
    },
    // A normal attack of his gives him its stacks as it lands, more as the Raging Oni King, and Ushi one as it takes an
    // Enemy's strike, off its cooldown, and one as it leaves. An Arataki Kesagiri that ends with stacks gained while it
    // Played readies the next
    onKitEvent: (event, { kitEffectState }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.TauntDamaged) {
        if (
          event.taunt.combatant.characterId !== characterId ||
          !startKitCooldown(kitEffectState, characterId, USHI_DAMAGED_COOLDOWN_STATUS_ID, USHI_DAMAGED_COOLDOWN_SECONDS)
        )
          return;
        gainSuperstrength(kitEffectState, combatant, 1);
        return;
      }

      if (event.kind === KitEventKind.NormalAttackLanded) {
        const index = kit.normalAttacks.indexOf(event.action);
        if (index === -1) return;
        const ragingOniKingStacks = checkIsRagingOniKing(kitEffectState.effects, characterId)
          ? (RAGING_ONI_KING_SUPERSTRENGTH_STACKS[index] ?? 0)
          : 0;
        gainSuperstrength(
          kitEffectState,
          combatant,
          (NORMAL_ATTACK_SUPERSTRENGTH_STACKS[index] ?? 0) + ragingOniKingStacks,
        );
        return;
      }

      if (event.kind !== KitEventKind.EffectExpired) return;
      const { effect } = event;
      if (effect.kind === "taunt" && effect.combatant.characterId === characterId)
        gainSuperstrength(kitEffectState, combatant, 1);
      else if (effect.kind === "stance" && effect.characterId === characterId) {
        const stacks = countKitResource(kitEffectState.effects, characterId, SUPERSTRENGTH_RESOURCE_ID);
        if (stacks > 0) addKesagiriStance(kitEffectState, combatant, stacks);
      }
    },
    // Masatsu Zetsugi throws Ushi onto the enemy it turned to, or where Itto stands without one, a taunt holding his Max
    // HP's share for its seconds from the hit. A second Ushi sends the first away
    skill: {
      // Ushi's hit gives a stack the first time it strikes, however many enemies it strikes
      hits: [
        {
          onStrike: ({ kitEffectState }, { combatant }) => {
            const { characterId } = combatant;
            if (!startKitCooldown(kitEffectState, characterId, USHI_STRUCK_STATUS_ID, kit.elementalSkill.seconds))
              return;
            gainSuperstrength(kitEffectState, combatant, 1);
          },
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }, target) => {
        for (const effect of kitEffectState.effects)
          if (effect.kind === "taunt" && effect.combatant.characterId === combatant.characterId)
            effect.secondsRemaining = 0;
        castKitTaunt(kitEffectState, { ...body, position: target?.position ?? body.position }, combatant, {
          health: ushiHealthShare * combatant.attributes.maxHealth,
          secondsRemaining: skillHitmarkSeconds + ushiSeconds,
        });
      },
    },
  };
};
