import type { Kit } from "#src/models/kit/Kit";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitHoldBehaviour } from "#src/models/kit/KitHoldBehaviour";
import type { KitMoonsignBenediction } from "#src/models/kit/KitMoonsignBenediction";
import type { KitVariantBehaviour } from "#src/models/kit/KitVariantBehaviour";
import type { KitPlunge } from "#src/models/kit/record/KitPlunge";

// What a character alone does, which no value of its record can hold: what each action of the record's slots sets going
// And each of their hits runs, the variants' checks, the Benediction's bonus, and the passives and constellations that
// Answer the kit's events and price its strikes. Its module returns it from its record's reader, and buildKit joins the
// Two into the kit
export interface KitBehaviour extends Partial<
  Pick<
    Kit,
    | "getChargedAttackStaminaMultiplier"
    | "getNormalAttackExtraHit"
    | "getNormalAttackSpeedBonus"
    | "getPassiveBonuses"
    | "getReactionDamageBonus"
    | "getSkillChargeBonus"
    | "getSkillCooldownMultiplier"
    | "getStrikeCriticalRateBonus"
    | "getStrikeDamageBonus"
    | "keepsNormalAttackCombo"
    | "onKitEvent"
    | "onSprint"
    | "onStep"
  >
> {
  burst?: KitActionBehaviour;
  burstVariant?: KitVariantBehaviour;
  chargedAttack?: KitActionBehaviour;
  moonsignBenediction?: Pick<KitMoonsignBenediction, "getBaseDamageBonus">;
  normalAttacks?: KitActionBehaviour[];
  plungeCollision?: KitHitBehaviour;
  plunges?: Partial<Record<KitPlunge, KitActionBehaviour>>;
  skill?: KitActionBehaviour;
  skillChain?: KitActionBehaviour[];
  skillHolds?: KitHoldBehaviour[];
}
