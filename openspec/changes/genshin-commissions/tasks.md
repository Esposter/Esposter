## 1. The kept day

- [x] 1.1 Record the instant each day's four were dealt and deal the day again when that instant is before the latest daily reset. Verify: a test named after the scenario 'a day dealt before the daily reset is dealt again', seen failing first.
- [x] 1.2 Keep the day's four across reloads before the reset. Verify: a test named after the scenario 'the day's four survive a reload before the daily reset', seen failing first.
- [x] 1.3 Deal the day again when the save is loaded into the session and its `dealtAt` is before the latest daily reset, with the pool, held places and rank the session holds. Verify: a test named after the scenario 'a day dealt before the daily reset is dealt again' that asserts the four are dealt again through the session load, not only the predicate, seen failing first.

## 2. Scene tasks

- [ ] 2.1 Replace an area's enemies and objects with a scene task's while the task is open. Verify: a test named after the scenario 'a scene task replaces its area's enemies while it is open', seen failing first. Open: the region data holds one stand-in camp, three members in Mondstadt, and none for the scene groups a task's `newGroupIds` name. `EnemyCamp` carries no game group id, so a swap cannot say which camps it replaces, and the commission names no area for it to stand in. Waits on the spawned places writing the scene groups' camps with their group ids.
- [ ] 2.2 Restore the area's own enemies and objects when the scene task is done and the area reloads. Verify: a test named after the scenario 'the area's own enemies return when the scene task is done', seen failing first. Open: the area's own groups are not extracted from the dump, so there is no set to restore. This waits on 2.1 and on that extraction, which no build reads yet.

## 3. Quest tasks and blocking

- [x] 3.1 Keep a commission from being dealt at a place a quest in progress holds. Verify: a test named after the scenario 'a commission is not dealt where a quest in progress stands', seen failing first.
- [x] 3.2 Finish a quest task with its quest. Verify: a test named after the scenario 'a quest task finishes with its quest', seen failing first.

## 4. Handbook

- [x] 4.1 Show the day's four on the Commissions tab with each preferred region. Verify: a test named after the scenario 'the Commissions tab lists the day's four with the preferred region', seen failing first.

## 5. Region pools and routing

- [x] 5.1 Join each region's commissions to the deal once its quest is done. Verify: tests named after the scenarios 'a region's commissions join the deal once its quest is done' and 'a region's commissions do not join the deal before its quest is done', seen failing first.
- [x] 5.2 Send a claim's Mora, items and Companionship EXP where each is kept. Verify: a test named after the scenario 'a claim sends its Mora, items and Companionship EXP where they are kept', seen failing first.
- [ ] 5.3 Route a commission claim's and a blossom's draws through one reward-routing primitive, so the Mora, Adventure EXP and Companionship EXP split and the bag's overflow refusal live in one place. Open: `routeCommissionClaim` routes the two EXP ids and `claimBlossom` leaves them out and routes no companionship, so the primitive's return contract is the design decision this waits on. Verify: the existing tests of `routeCommissionClaim` and `claimBlossom` pass unchanged against the shared primitive.

## 6. Encounter Points earned

- [x] 6.1 Hold a day's Encounter Points for the daily reset they were earned on, and read a balance earned before the latest reset as none. Verify: the test named after the scenario 'Encounter Points earned before the daily reset are gone' in `readEncounterPoints.test.ts`.
- [x] 6.2 Earn an Archon or Story quest's four Encounter Points on its completion, held up to the storage of four less one for each daily commission finished. Verify: the test named after the scenario 'a finished Archon quest earns four Encounter Points' in `useWorldCommissions.test.ts`, and the storage test in `computeEncounterPointStorage.test.ts`.
- [x] 6.3 Save the points with the day, backfill the stored saves to none held, and keep the later reset's points on a merge. Verify: the merge tests 'keeps the Encounter Points earned on the later daily reset' and 'keeps the larger count of Encounter Points when both copies earned them on the same daily reset'. The dev backfill of the stored saves runs at landing, outside the repo.
- [ ] 6.4 Earn the chests' points: one for a Luxurious Chest in a Shrine of Depths, and 0.5 for another chest that is not a domain's, a quest's, a Hidden Exploration Objective's or Takashi's common chest, and not a Mora chest. Open: `chestOpened` carries no chest kind, so the Shrine's Luxurious Chest cannot be told from the others.
- [ ] 6.5 Earn 0.5 for each collected Oculus, Crimson Agate, Lumenspar, Plumes of Purifying Light, Spirit Carp and Mnemonic Cluster. Open: the collected items' ids are not mapped to these kinds, and the wiki page gives no amount for Mnemonic Cluster.
- [ ] 6.6 Earn the points of World quests, Hangout first completions, Event quests and each event's budget. Open: the wiki gives these as varying amounts and per-version totals, not per quest, so the amounts are not settled.
- [x] 6.7 Keep the points past the storage as Long-Term Encounter Points, reset with the major version they were earned in, and convert 30 Original Resin into one of them while the daily points fall short by a whole point. Verify: the test 'a finished Archon quest past the storage keeps the overflow as Long-Term Encounter Points' in `packages/genshin-world/src/composables/useWorldCommissions.test.ts`, and 'should convert a long-term point for thirty Original Resin, where the daily points are a whole point short' in `packages/genshin-world/src/services/commission/convertLongTermEncounterPoint.test.ts`.
- [x] 6.8 Spend the claimed point from the half points held. Verify: the test 'should claim an unfinished commission for a whole point, spending two half points and keeping the half' in `packages/genshin-world/src/services/commission/claimCommissionWithPoints.test.ts`.
- [ ] 6.9 Claim a dealt commission and convert a Long-Term Encounter Point from a screen, through `claimCommissionWithPoints` and `convertLongTermEncounterPoint`, so the save's points are the ones a claim spends. Open: no screen does either yet, so no claim spends the points held and no long-term point converts.
