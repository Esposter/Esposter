# Game rules and combat

Read when a rule moves over time, an enemy's AI steps, or a hit is priced.

- **A game rule that moves over time is a deterministic step in the world.** An enemy's AI is `stepEnemy`: it reads its state, its target and the step's seconds, writes the state in place, and reads no clock and no random source of its own, so a test steps it exactly as the world's fixed-step loop does. A rule's numbers read from the game's tables are published to the hosted game data by a `genshin:assets` command for only what the world names, their enums spelt as the tables spell them so the rows parse straight in; what the tables lack is authored beside them from the wiki (`openspec/specs/genshin/enemies/design.md`).

- **Combat is one set of rules every feature calls into.** A target's elements are an `ElementalState`, moved on at the fixed step by `advanceElementalState` and hit through `applyInternalCooldown` then `applyElement`, and a hit or a reaction is priced by `services/combat/damage`, never by a formula of a feature's own. The elements are the one `Element` enum, never a second (`openspec/specs/genshin/combat/design.md`).
