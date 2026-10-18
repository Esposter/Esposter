import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";
import type { KitStackedHit } from "#src/models/kit/KitStackedHit";

// What a character alone gives one hit of its record: what the hit runs as it strikes, and what no value holds of the
// Bubble, the party heal or the stacked hit its record holds, the bubble's omen's id, the heal's chance and the status
// Whose stacks set the hit. A hit that takes its wielder's element drops the one its record names, so it deals the element
// The wielder holds when it strikes
export interface KitHitBehaviour extends Partial<
  Pick<KitHit, "additiveBaseDamageBonus" | "enemyStatus" | "healAttackShare" | "onStrike">
> {
  bubbleOmenId?: EnemyStatus["id"];
  takesWielderElement?: boolean;
  healPartyChance?: KitPartyHeal["chance"];
  stackedHitStatusId?: KitStackedHit["statusId"];
}
