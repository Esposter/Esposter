# Status Effects

Battle conditions (poison, sleep, burn) and an elemental type chart multiplying damage by matchup.

**Why deferred:** Both mechanics only create decisions when monsters have distinct kits and stats; with today's roster they'd be invisible complexity. The `Status` model (`health`/`experience`) and the battle state machine would both grow meaningfully — worth doing once, after the foundations.

**Revisit when:** the roster grows beyond five species — [attack power and defense](../../../specs/dungeons/battle/design.md) and the [roster's stat/kit differentiation](../../../specs/dungeons/monsters-and-items/design.md) have both shipped, so new species art is the remaining gate for a type chart to have enough matchups to matter.
