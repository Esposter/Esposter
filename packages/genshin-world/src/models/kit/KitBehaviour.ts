import type { Kit } from "#src/models/kit/Kit";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitHoldBehaviour } from "#src/models/kit/KitHoldBehaviour";
import type { KitMoonsignBenediction } from "#src/models/kit/KitMoonsignBenediction";
import type { KitStellarJubilee } from "#src/models/kit/KitStellarJubilee";
import type { KitVariantBehaviour } from "#src/models/kit/KitVariantBehaviour";
import type { KitPlunge } from "#src/models/kit/record/KitPlunge";

// What a character alone does, which no value of its record can hold: what each action of the record's slots sets going
// And each of their hits runs, the variants' checks, the Benediction's and the Stellar Jubilee's bonuses, and the
// Passives and constellations that answer the kit's events and price its strikes. Its module returns it from its record's
// Reader, and buildKit joins the two into the kit
export interface KitBehaviour extends Partial<
  Pick<
    Kit,
    | "checkIsSkillCooldownWaived"
    | "getChargedAttackStaminaMultiplier"
    | "getConversionBonuses"
    | "getNormalAttackExtraHit"
    | "getNormalAttackSpeedBonus"
    | "getPartyReactionBonus"
    | "getPartyStrikeBonus"
    | "getPassiveBonuses"
    | "getSkillChargeBonus"
    | "getSkillCooldownMultiplier"
    | "getStrikeAdditiveBaseDamageBonus"
    | "getStrikeCriticalDamageBonus"
    | "getStrikeCriticalRateBonus"
    | "getStrikeDamageBonus"
    | "getStrikeDefenceIgnored"
    | "jumpsSkillHoldToTop"
    | "keepsNormalAttackCombo"
    | "onKitEvent"
    | "onSprint"
    | "onStep"
    | "refusesFall"
  >
> {
  burst?: KitActionBehaviour;
  burstVariant?: KitVariantBehaviour;
  chargedAttack?: KitActionBehaviour;
  chargedAttackVariant?: KitVariantBehaviour;
  moonsignBenediction?: Pick<KitMoonsignBenediction, "getBaseDamageBonus">;
  normalAttacks?: KitActionBehaviour[];
  plungeCollision?: KitHitBehaviour;
  plunges?: Partial<Record<KitPlunge, KitActionBehaviour>>;
  plungeVariants?: KitVariantBehaviour[];
  skill?: KitActionBehaviour;
  skillChain?: KitActionBehaviour[];
  skillHolds?: KitHoldBehaviour[];
  stellarJubilee?: Pick<KitStellarJubilee, "getBaseDamageBonus">;
}
