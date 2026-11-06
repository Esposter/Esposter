## 1. The claims' rewards by World Level

- [x] 1.1 Read each refresh row's reward previews and pay the row for the reader's World Level, the last row past the list. Verify: `toLeyLineRegions.test.ts` gains a refresh row listing two previews and asserts its kind's two reward rows, and `computeOutcropClaimRewards.test.ts` asserts a scenario named "World Level 9 claims the last of nine rows" and "World Level 0 claims the first reward row", written first and seen failing.

## 2. The reset and the outcrop's states

- [x] 2.1 Move an outcrop through waiting, fighting and cleared, and on each claim to the nearest other place, with the daily reset drawing new places. Verify: tests named after the scenarios "A cleared outcrop stays in place until the reset", "Claiming moves the outcrop to the nearest other place" and "The daily reset draws new places for open outcrops", written first and seen failing.

## 3. The challenge and the blossom

- [ ] 3.1 Add the touch, the fight, the reveal and the claim in Mondstadt first, each place one of the official map's Ley Line Blossom points. Verify: tests named after the scenarios "Touching an outcrop spawns its enemies", "Defeating the last enemy reveals the blossom", "An outcrop with an enemy still alive shows no blossom" and "A claim without enough resin is refused", written first and seen failing. The reveal and the still-alive case share one test, whose first assertion is the second. Blocked: a camp spawns at `OUTCROP_CAMP_LEVEL` before the World Level raises it, and no outcrop test reads the raised level, so the touch is proven for its members and their radius only.

## 4. Decisions

- [x] 4.1 Decide whether Liyue opens its blossoms at Adventure Rank 8 and 12, as the wiki has it, or at 18, as the dump's table does, from the reference clip of the map at ranks 8 and 18. This task names the options and decides nothing.
- [x] 4.2 Decide whether a claim grants the previews' 100 Adventure EXP or leaves it out as it does the Companionship EXP. This task names the options and decides nothing.

## 5. The regions the dump does not cover

- [ ] 5.1 Add the blossoms of Fontaine, Natlan, Snezhnaya and Nod-Krai once each one's Ley Line Blossom points are fitted into its region data as outcrop places, as Mondstadt's are, and the dump's section order table names its sections. Verify: tests named after the scenario "Touching an outcrop spawns its enemies", run for each of the four regions.
