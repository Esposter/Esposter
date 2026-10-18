## 1. Mondstadt's keeper

- [x] 1.1 Place Mondstadt's keeper at her estimated spot, marked provisional, and open the Reputation screen when she is talked to. Verify: tests named after the scenarios 'Talking to Mondstadt's keeper opens its Reputation screen' and 'The Reputation screen is not reached before the keeper stands', written first and seen failing.

## 2. Requests and bounties

- [ ] 2.1 Offer requests from level two as world quests, paying EXP and Mora on completion. Verify: tests named after the scenarios 'A request is not offered before level two' and 'A delivery request pays on completion'. The fifteen Mondstadt requests are offered and accepted: twelve for exact items and 7070901, 7071001 and 7071101 for any one item of a food group, by the row's count.
- [ ] 2.2 Offer bounties from level two, spawning the target when a bounty is taken and claiming it back after its defeat. Verify: tests named after the scenarios 'A bounty's target spawns when the bounty is taken' and 'A bounty cannot be claimed before its target is defeated'.
- [x] 2.3 Decide how a Reputation quest row is bound to the quest that pays it. The options are the quest its parentQuestId names, or the quest that pays the row's reward; this task decides nothing. Verify: the chosen option is recorded in this change before task 3.1 starts.

## 3. Exploration, quests and discounts

- [ ] 3.1 Pay each exploration threshold once as the percentage passes it, and each Reputation quest once, bound as task 2.3 settles. Verify: tests named after the scenarios 'Passing an exploration threshold pays once', 'A passed threshold does not pay again' and 'A finished Reputation quest pays once'. Its Reputation-quest half is built, and Mondstadt's 23 parents are carried; their records wait on their binaries in the dump, so the quest reader cannot publish them yet. The exploration thresholds pay on the carried exploration progress; the test named 'A passed threshold does not pay again' is not written yet.
- [x] 3.2 Apply discounts at their named shops once the shops have a screen. Verify: tests named after the scenarios 'A discount applies at its named shop' and 'A discount does not apply at an unnamed shop'.

## 4. Natlan

- [ ] 4.1 Offer Natlan's bounties from level one, and its supply notices with their tribes' EXP. Verify: tests named after the scenarios 'Natlan's keeper offers bounties from level one', 'A donation to a supply notice pays its tribe and the player' and 'A fourth supply notice in a week is refused'.
