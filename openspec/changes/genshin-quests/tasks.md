## 1. Go-to places

- [ ] 1.1 Read each carried go-to's guide and place it in its region's data: a dummy point from the client's dummy points, or an NPC from the residents' places, with its provisional radius. Verify: a test named after the scenario 'Reaching a go-to place completes the step', written first and seen failing. Open: the dummy-point go-tos stay blocked, since the client's `scene3_dummy_points.lua` is decoded only by `genshin:assets scene-scripts`, whose output stays local by design, so no hosted key or committed file holds the points. The NPC-guided go-tos are not built yet: the carried quests record each step's guide NPC (`guideNpcId`, read from a `QUEST_GUIDE_NPC` beside the step's trigger), and no region writer joins it to a resident's place. The scenario's behaviour already holds in `getEnteredGoToEvents.test.ts` and `advanceQuest.test.ts`; what is missing is the place data.
- [x] 1.2 Keep a step open outside its radius, and point the beam at the place of a tracked go-to. Verify: tests named after the scenarios 'Standing outside the radius leaves the step open' and 'Tracking a go-to step points the beam at its place'.

## 2. World quest series

- [x] 2.1 Add the chapter table to the dump tables, and list the series whose first quest a placed resident offers under its title and number. Verify: a test named after the scenario 'A chapter lists its title and number', written first and seen failing.
- [x] 2.2 Show an empty journal for a series with no words. Verify: a test named after the scenario 'A chapter with no words shows an empty journal'.
- [x] 2.3 Unlock a series' quests one after another. Verify: tests named after the scenarios 'The next quest is offered once the one before is finished' and 'A later quest is not offered early'.

## 3. Measures owed

- [ ] 3.1 Measure the Adventurer Handbook and the navigation beam from the English PC client's recordings, and set the beam's radius and colour constants from them. Verify: the constants hold the measured values once the recordings exist, and stay as they are until then.
