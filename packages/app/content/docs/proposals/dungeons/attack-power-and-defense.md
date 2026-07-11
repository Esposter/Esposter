---
title: Attack power and defense
description: Proposal — give attacks a power value and monsters a defense stat so combat choices differ.
---

# Attack Power and Defense

Add `power` to attacks and `defense` to monster stats, and fold both into the damage roll. Today damage is `ceil(random(0.85, 1.01) × attacker.attack)` — attacks carry no power (an `Attack` is just id + sound + animation), so a monster's moves are cosmetically different but mechanically identical, and there is no defensive axis at all. Move choice, the core decision of a turn, currently doesn't matter.

## Scope

**Today:** `Attack { id, soundEffectKey }` (+ animation component via `AttackComponentMap`), `Stats { level, maxHp, attack, baseExp }`, `calculateDamage(attack)`.

**This adds:** `Attack.power`, `Stats.defense` (with per-species base values and level-up growth), and a damage formula using both. Save-compatible for attacks (attack definitions are content, monsters store only `attackIds`); monster instances in saves need a `defense` default on read.

## How it works

- `AttackMap` entries gain `power` (e.g. Slash 40, Ice Shard 55 — differentiated, so each species' kit feels distinct as the roster grows).
- `MonstersDataMap` species gain `defense` base values; `levelUp` grows defense like attack (+1–2).
- Damage: `ceil(random(0.85, 1.01) × attack × power / (power + defense))` — a simple saturating formula: defense meaningfully reduces damage without immunity, and tuning stays two-knob.
- `calculateDamage` takes `(attack, power, defense)`; both `PlayerAttack` and `EnemyAttack` states pass the chosen attack's power and the defender's defense.
- Existing saves: `monsterSchema` defaults `stats.defense` from the species data when absent (`.catch`/`.default` on read), so no migration step.

## Key files

Paths relative to `packages/app`.

| File                                               | Change                  |
| -------------------------------------------------- | ----------------------- |
| `shared/models/dungeons/attack/Attack.ts`          | `power` field           |
| `app/assets/dungeons/data/attacks.ts`              | per-attack power values |
| `shared/models/dungeons/monster/Stats.ts`          | `defense` field         |
| `shared/assets/dungeons/data/monstersData.ts`      | per-species defense     |
| `app/services/dungeons/monster/calculateDamage.ts` | new formula             |
| `app/services/dungeons/monster/levelUp.ts`         | defense growth          |

## Notes

- Deliberately stops short of a type-effectiveness chart — that only pays off with a bigger roster; see [monster roster expansion](/docs/proposals/dungeons/monster-roster-expansion) and the deferred [status effects](/docs/dungeons/deferred/status-effects).
- Tune values so early battles keep their current length (~5 hits to a 25 HP monster): with the suggested numbers, `power / (power + defense)` sits near 0.9 at low levels, close to today's raw-attack damage.
