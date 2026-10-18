## 1. Rewards

- [x] 1.1 Resolve each reward of a clear to its items and give them: wallet currencies to the wallet, the rest to the bag, refused whole when the bag has no room. Verify: claimAbyssRewards.test.ts, written first and seen failing, named after 'Primogems and Mora from a reward go to the wallet', 'A material from a reward goes into the bag' and 'A claim is refused whole when the bag has no room'.

## 2. Chambers

- [x] 2.1 Enter a chamber with the party set. Verify: a test named after the scenarios 'A chamber is entered with the party set' and 'A chamber cannot be entered without a party'.
- [ ] 2.2 Advance each half when its last enemy is defeated, with a two-team chamber's second half taking its enemies from its scene. Verify: tests named after 'A half advances when its last enemy is defeated' and 'A two-team chamber's second half takes its enemies from its scene'. Blocked until the chamber's domain scene is derived.
- [x] 2.3 Carry health and energy into the next chamber and award stars against the clock. Verify: tests named after 'Health and energy at a clear carry into the next chamber', 'Clearing a chamber with time left earns its stars' and 'A chamber not cleared before its clock runs out fails'. The carry is the snapshot the design records: taken at the clear, and the next chamber starts from it.

## 3. Blessings and the wormhole

- [ ] 3.1 Offer each Moon Spire period's blessing and the Corridor's blessing choices once read from a source. Verify: tests named after 'A Moon Spire chamber shows its period's blessing' and 'A Corridor chamber offers its blessing choices'. Built: the periods carry their blessing and close, the chambers' three Benediction lists are published as `spiralAbyss/benedictionChoices`, the period covering an instant is found, the Stardread module is written, and `getAbyssChamberBlessing` gives a chamber its offer, with the Corridor's list picked by `pickAbyssBenedictionList` (provisional). Open: the screens that show the blessing and offer the choices, which are blocked on the 38 text keys (36 Benedictions, Stardread's name and description) that `genshin:text write` must add, and on the Benedictions' description hashes, which the published choices do not carry yet; and the other periods' blessing modules.
- [ ] 3.2 Lead the wormhole at Cape Oath to Musk Reef once its scene is derived. Verify: a test named after the scenario 'Entering the wormhole at Cape Oath leads to Musk Reef'.
