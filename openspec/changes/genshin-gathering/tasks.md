## 1. Mining outcrops

- [x] 1.1 Draw each region's daily mining outcrops at their places, from Adventure Rank 30, at the 04:00 reset in UTC+8. Verify: tests named after the scenarios 'Outcrops appear at 04:00 with the day's draw' and 'No outcrops appear below Adventure Rank 30' written first and seen failing.
- [x] 1.2 Keep a mined outcrop gone until the next day's draw, and break it by a claymore or a blunt hit for its ore. Verify: tests named after the scenarios 'A mined outcrop is gone for the day' and 'An unmined outcrop is gone at the next day's draw' written first and seen failing, and the test 'a claymore break drops the outcrop's ore and leaves it gone until the next reset'.

## 2. Investigation spots

- [ ] 2.1 Place the investigation spots at the Investigation label's points and give each its rewards once. Verify: a test named after the scenario 'An investigated spot gives its rewards' written first and seen failing. Blocked on the PC's scene-group export: the official map's Investigation label holds no points (point_count 0), and the dump's gadget and investigation tables carry no positions.
- [ ] 2.2 Return a Mora spot at its refresh. Verify: a test named after the scenario 'A Mora spot comes back as its refresh says' written first and seen failing. Blocked with 2.1: a Mora spot's place and refresh come from the same scene-group export.
- [x] 2.3 Count investigations per game day from the 04:00 reset and stop new spawns at a hundred. Verify: tests named after the scenarios 'The hundredth investigation stops new spawns' and 'The day's count restarts at the 04:00 reset' written first and seen failing. The day's count from the reset, the cap and the day's store are built ([investigation](../../specs/genshin/investigation/design.md)): the save's `investigationDay` slice keeps the count and its key, not each investigation's instant.
