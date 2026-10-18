## 1. The kept day

- [ ] 1.1 Record the instant each day's four were dealt and deal the day again when that instant is before the latest daily reset. Verify: a test named after the scenario 'a day dealt before the daily reset is dealt again', seen failing first.
- [x] 1.2 Keep the day's four across reloads before the reset. Verify: a test named after the scenario 'the day's four survive a reload before the daily reset', seen failing first.
- [ ] 1.3 Deal the day again when the save is loaded into the session and its `dealtAt` is before the latest daily reset, with the pool, held places and rank the session holds. Verify: a test named after the scenario 'a day dealt before the daily reset is dealt again' that asserts the four are dealt again through the session load, not only the predicate, seen failing first.

## 2. Scene tasks

- [ ] 2.1 Replace an area's enemies and objects with a scene task's while the task is open. Verify: a test named after the scenario 'a scene task replaces its area's enemies while it is open', seen failing first.
- [ ] 2.2 Restore the area's own enemies and objects when the scene task is done and the area reloads. Verify: a test named after the scenario 'the area's own enemies return when the scene task is done', seen failing first.

## 3. Quest tasks and blocking

- [x] 3.1 Keep a commission from being dealt at a place a quest in progress holds. Verify: a test named after the scenario 'a commission is not dealt where a quest in progress stands', seen failing first.
- [x] 3.2 Finish a quest task with its quest. Verify: a test named after the scenario 'a quest task finishes with its quest', seen failing first.

## 4. Handbook

- [ ] 4.1 Show the day's four on the Commissions tab with each preferred region. Verify: a test named after the scenario 'the Commissions tab lists the day's four with the preferred region', seen failing first.

## 5. Region pools and routing

- [x] 5.1 Join each region's commissions to the deal once its quest is done. Verify: tests named after the scenarios 'a region's commissions join the deal once its quest is done' and 'a region's commissions do not join the deal before its quest is done', seen failing first.
- [x] 5.2 Send a claim's Mora, items and Companionship EXP where each is kept. Verify: a test named after the scenario 'a claim sends its Mora, items and Companionship EXP where they are kept', seen failing first.
