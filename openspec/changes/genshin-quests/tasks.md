## 1. Go-to places

- [x] 1.1 Read each carried go-to's guide and place it in its region's data: a dummy point from the client's dummy points, or an NPC from the residents' places, with its provisional radius. Verify: a test named after the scenario 'Reaching a go-to place completes the step', written first and seen failing. Done for the dummy-point go-tos: quest 352's steps 35200 and 35201 name triggers 1021, 1001 and 1095, each guided to `Q352View`, which the scene's dummy points place at 719.65, 214.9 in Mondstadt's axes (classified by the fit's region map, the same as the residents); mondstadt.json holds the three places at a provisional 10 metres. The scenario's behaviour was already green in `getEnteredGoToEvents.test.ts` and `advanceQuest.test.ts`, and the place is data `regionData.test.ts` parses, so no new test pins the place. Not built: the NPC-guided go-tos, by ruling (quest 352's steps 35203 and 35204 are guided to NPC 1005, which no scene places), and quest 351's dummy points, `Q351ClimbEnd` and `Q351Trans`, since quest 351 is not carried.
- [x] 1.2 Keep a step open outside its radius, and point the beam at the place of a tracked go-to. Verify: tests named after the scenarios 'Standing outside the radius leaves the step open' and 'Tracking a go-to step points the beam at its place'.

## 2. World quest series

- [x] 2.1 Add the chapter table to the dump tables, and list the series whose first quest a placed resident offers under its title and number. Verify: a test named after the scenario 'A chapter lists its title and number', written first and seen failing.
- [x] 2.2 Show an empty journal for a series with no words. Verify: a test named after the scenario 'A chapter with no words shows an empty journal'.
- [x] 2.3 Unlock a series' quests one after another. Verify: tests named after the scenarios 'The next quest is offered once the one before is finished' and 'A later quest is not offered early'.

## 3. Measures owed

- [ ] 3.1 Measure the Adventurer Handbook and the navigation beam from the English PC client's recordings, and set the beam's radius and colour constants from them. Verify: the constants hold the measured values once the recordings exist, and stay as they are until then.
