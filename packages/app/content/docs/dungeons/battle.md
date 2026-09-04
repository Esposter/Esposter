---
title: Battle
description: The 17-state battle state machine and the damage, experience, level-up, capture, and flee math.
---

# Battle

Turn-based 1v1 battles driven by a state machine: the player picks Fight / Switch / Item / Flee, states play out both sides' actions with tweens and dialog, and the battle ends in victory experience, a capture, a flee, or a party wipe.

## How it works

`StateMachine` is a minimal generic class — a map of named states with `onEnter`/`onExit` hooks and an async `setState` — instantiated once as `battleStateMachine` over the 17 battle states. Each state file under `models/dungeons/state/battle/states/` owns one phase and decides the next transition, so a turn is a chain of small, testable steps rather than a monolithic update loop.

```mermaid
stateDiagram-v2
  [*] --> Intro
  Intro --> PreBattleInfo
  PreBattleInfo --> BringOutMonster
  BringOutMonster --> PlayerInput
  PlayerInput --> Battle: Fight
  PlayerInput --> SwitchAttempt: Switch
  PlayerInput --> ItemAttempt: Item
  PlayerInput --> FleeAttempt: Flee
  ItemAttempt --> CatchMonster: ball
  ItemAttempt --> EnemyInput: heal
  CatchMonster --> Finished: success
  CatchMonster --> EnemyInput: failure
  SwitchAttempt --> SwitchMonster
  SwitchMonster --> EnemyInput
  FleeAttempt --> Finished: escaped
  FleeAttempt --> EnemyInput: failed
  EnemyInput --> Battle
  Battle --> PlayerAttack: player first
  Battle --> EnemyAttack: enemy first
  PlayerAttack --> PlayerPostAttackCheck
  PlayerPostAttackCheck --> GainExperience: enemy fainted
  PlayerPostAttackCheck --> EnemyAttack: enemy still to act
  PlayerPostAttackCheck --> PlayerInput: turn over
  EnemyAttack --> EnemyPostAttackCheck
  EnemyPostAttackCheck --> SwitchMonster: player monster fainted
  EnemyPostAttackCheck --> PlayerAttack: player still to act
  EnemyPostAttackCheck --> PlayerInput: turn over
  GainExperience --> Finished
  Finished --> [*]
```

The math, all in small pure services under `services/dungeons/monster/` and `services/dungeons/item/`:

- **Damage** — `ceil(random(0.85, 1.01) × attacker.statistics.attack × power / (power + defense))`. Each attack carries a `power` (Slash 40, Ice Shard 55) and every monster a `defense` stat, so move choice and bulk both matter. The saturating `power / (power + defense)` factor means defense meaningfully reduces damage without ever granting immunity, and tuning stays two-knob.
- **Experience** — on a kill, `round(baseExperience × enemyLevel / 7)`; `useExperience` applies it and loops `levelUp` while the threshold (`getLevelExperience`) is crossed. Level-ups add randomized `maxHealth` (+5–8), `attack` (+1–2), and `defense` (+1–2).
- **Capture** — ball items roll `0.5 + (1 − health/maxHealth) × 0.2` against a uniform random: success joins the party, a near miss (within 0.1) gets its own dialog, otherwise failure — so weakening the enemy first genuinely helps.
- **Flee** — a random escape attempt; failure forfeits the turn.

Attack visuals are Vue components (`DungeonsBattleAttackSlash`, `DungeonsBattleAttackIceShard`) selected by `AttackComponentMap` and animated with spritesheet tweens; monster HP/EXP bars are the shared `UI/Bar` components.

## Key files

Paths relative to `packages/app/app`.

| File                                                   | Role                                              |
| ------------------------------------------------------ | ------------------------------------------------- |
| `models/dungeons/state/StateMachine.ts`                | generic state machine                             |
| `models/dungeons/state/battle/StateMap.ts`             | the 17 battle states                              |
| `services/dungeons/scene/battle/battleStateMachine.ts` | the singleton instance                            |
| `services/dungeons/monster/getDamage.ts`               | damage roll                                       |
| `assets/dungeons/data/attacks.ts`                      | per-attack power values                           |
| `services/dungeons/monster/getExperienceGain.ts`       | experience award                                  |
| `services/dungeons/monster/levelUp.ts`                 | stat growth                                       |
| `services/dungeons/item/createCaptureResult.ts`        | capture roll                                      |
| `store/dungeons/battle/`                               | per-battle stores (player, enemy, dialog, action) |

## Notes

- The `Battle` state orders the two attacks through `useAttackStatePriorityMap` and the post-attack checks route to the other side's attack via the same map. The enemy AI is trivial: `EnemyAttack` picks a uniformly random attack from the monster's `attackIds`.
- Power and defense are tuned so a low-level battle still runs about as long as raw attack alone would make it: at base defense 5, `power / (power + defense)` sits near 0.9, so the stat matters without slowing the early game down.
- A type-effectiveness chart is deliberately out of scope until the roster grows beyond the current five [differentiated species](/docs/dungeons/monsters-and-items) — see the deferred [status effects](/docs/dungeons/deferred/status-effects).
