## 1. The node's pulse

- [x] 1.1 Count a node's clock down and pulse once per fifteen seconds, a long step passing each pulse it crosses. Verify: `stepElementalNode.test.ts`, tests named after the scenarios 'A node pulses once each fifteen seconds' and 'A long step counts each pulse it passes', written first and seen failing.
- [x] 1.2 Lay the node's gauge on an enemy in reach, the full gauge unbuffed and 1.2 more buffed up to the cap, with the buff's resistance. Verify: `pulseElementalNode.test.ts`, tests named after the scenarios 'An unbuffed enemy gains the node's full gauge, which does not decay', 'A buffed enemy gains 1.2 more gauge, up to 3.6' and 'A buffed enemy resists more to its node's element and to every other while the buff lasts'.
- [x] 1.3 Spend the pulses of a cooldown without laying gauge. Verify: test named after the scenario 'A pulse on an enemy cooling down spends the pulse and lays nothing'.
- [x] 1.4 Lift a buff a reaction depletes at the next step and start its two-pulse cooldown, keeping a buff still held. Verify: `stepElementalNodeBuffs.test.ts`, tests named after the scenarios 'A buff a reaction depletes is lifted at the next step and its enemy waits two pulses to regain it' and 'A buff still held is kept through a step'.

## 2. Placements and hits in the world

- [ ] 2.1 Place each node from the scene groups, with its element. Blocked: the scene groups this build holds carry no node, and their group scripts need the PC export (`openspec/changes/genshin-puzzles/`).
- [ ] 2.2 Place each Infusion Stone and destroy one, removing its buffs. Blocked: the stones' gadget identity is unconfirmed in the world, and the dump holds no stone hit points or weakness data.
- [ ] 2.3 Call the node's pulse on each enemy in reach each fixed step. Blocked on 2.1, since no node stands in the world to pulse; the reach radius is provisional (see the design's Notes).
