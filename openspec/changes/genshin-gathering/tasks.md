## 1. Mining outcrops

- [ ] 1.1 Draw each region's daily outcrop places beside the ley line places, from Adventure Rank 30, arriving at 06:00 in UTC+8. Verify: tests named after the scenarios 'Outcrops appear at 06:00 with the day's draw' and 'No outcrops appear below Adventure Rank 30' written first and seen failing. Waiting on the ley line places: the [ley line outcrops](../../specs/genshin/ley-line-outcrops/design.md) page still waits on the [spawned places](../genshin-spawned-places/design.md) change.
- [ ] 1.2 Keep a mined outcrop gone until the next day's draw. Verify: tests named after the scenarios 'A mined outcrop is gone for the day' and 'An unmined outcrop is gone at the next day's draw' written first and seen failing. Blocked on 1.1, since an outcrop must first stand to be mined.

## 2. Investigation spots

- [ ] 2.1 Place the investigation spots at the Investigation label's points and give each its rewards once. Verify: a test named after the scenario 'An investigated spot gives its rewards' written first and seen failing.
- [ ] 2.2 Return a Mora spot at its refresh. Verify: a test named after the scenario 'A Mora spot comes back as its refresh says' written first and seen failing.
- [ ] 2.3 Count investigations per game day from the 04:00 reset and stop new spawns at a hundred. Verify: tests named after the scenarios 'The hundredth investigation stops new spawns' and 'The day's count restarts at the 04:00 reset' written first and seen failing. Waiting on [genshin-investigation](../genshin-investigation/tasks.md) task 1.1, which keeps the day's count from the game's daily reset.
