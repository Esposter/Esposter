## 1. Seelies in Mondstadt

- [x] 1.1 Add the Seelie court kind and publish Mondstadt's thirty courts through the puzzle points pipeline, then pair each court with one Seelie, closest first. Verify: `pairSeelieCourts.test.ts` asserts that two courts and three Seelies pair closest first, the third Seelie is left unpaired, and a court is never taken twice, written first and seen failing.
- [x] 1.2 Step each paired Seelie along its route while it is followed, and settle it at its court. Verify: tests named after the scenarios 'A followed Seelie reaches its court and spawns its chest' and 'A Seelie left unfollowed returns to its start'.

## 2. Elemental Monuments in Mondstadt

- [x] 2.1 Give each Mondstadt monument its kind's element and timing, from the wiki where it gives them and provisional where it does not. Verify: `toMonumentPlace.test.ts` asserts that a mark takes its kind's element and timing, and that a kind the wiki gives neither for is left provisional.
- [x] 2.2 Light a monument when struck by its element or by a reaction producing it, and refuse another element. Verify: tests named after the scenarios 'A strike of its element lights a monument', 'A reaction of its element lights a monument' and 'A strike of another element does not light a monument'.
- [x] 2.3 Let a timed monument go out once its time passes. Verify: a test named after the scenario 'A timed monument goes out after its time'.
- [x] 2.4 Solve a puzzle when its monuments are lit together, and keep it solved. Verify: tests named after the scenarios 'Lighting every monument together solves the puzzle', 'A monument going out first leaves the puzzle unsolved' and 'A solved puzzle stays solved'.

## 3. Other kinds

- [x] 3.1 Start each Time Trial Challenge from its marker with its wiki limit and targets, and spawn the chest only when every target is done in time. Verify: tests named after the scenarios 'Finishing every target in time spawns the chest' and 'A missed target before the timer ends gives no chest'.
- [x] 3.2 Open Shrines of Depths only with their region's key. Verify: tests named after the scenarios 'A shrine opens with its region's key' and 'A key from another region is refused'.
- [ ] 3.3 Place the other Seelies from the wiki's Seelie pages, provisional where the wiki gives none. Verify: `pnpm -C scripts genshin:assets puzzles` publishes them, and the Mondstadt Seelie tests in 1.2 still pass.
