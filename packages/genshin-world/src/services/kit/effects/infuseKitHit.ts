import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInfusion } from "#src/models/kit/KitInfusion";

import { AttackTag } from "#src/models/combat/AttackTag";

// The kinds of action an infusion takes the hits of: the normal attacks, the charged attack and the plunges
const INFUSED_ACTION_ATTACK_TAGS = new Set<AttackTag>([
  AttackTag.ChargedAttack,
  AttackTag.NormalAttack,
  AttackTag.PlungingAttack,
]);

// A landed hit as an infusion deals it, if it sits in a normal attack, the charged attack or a plunge: its element at
// The gauge the hit gives it: its own gauge, else the one it takes while infused, a collision's 0U, else the infused
// Element's 1U. An infusion that converts its attacks also gives the hit its converted poise and reach,
// Where it has them, and an infusion with a DMG Bonus adds it to the hit's own. Any other hit lands as it is
export const infuseKitHit = (hit: KitHit, { damageBonus, element, isConverted }: KitInfusion): KitHit =>
  hit.actionAttackTag !== undefined && INFUSED_ACTION_ATTACK_TAGS.has(hit.actionAttackTag)
    ? {
        ...hit,
        ...(damageBonus !== undefined && { damageBonus: (hit.damageBonus ?? 0) + damageBonus }),
        element,
        gauge: hit.gauge ?? hit.infusedGauge ?? 1,
        hitArea: isConverted ? (hit.convertedHitArea ?? hit.hitArea) : hit.hitArea,
        poiseDamage: isConverted ? (hit.convertedPoiseDamage ?? hit.poiseDamage) : hit.poiseDamage,
      }
    : hit;
