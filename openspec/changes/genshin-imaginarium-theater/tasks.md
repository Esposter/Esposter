## 1. A season's cast

- [x] 1.1 Fetch the role combat avatar config table, model its row under the dump's keys, and add the season's elements, opening characters and special guests to each season. Verify: a test named "toImaginariumSeason.test.ts" with the codes [2, 5, 6, 0] reading Pyro, Electro and Cryo, written first and seen failing, and a data run named after the scenario "A season whose openers' elements differ fails the data run".
- [x] 1.2 Answer whether a character may join a season's Alternate Cast at a difficulty. Verify: a test file "checkIsImaginariumCastEligible.test.ts" with the scenarios "A character of a season element joins the Alternate Cast", "A special guest of any element joins the Alternate Cast", "A character off the season's elements is refused" and "A character below the level floor is refused", written first and seen failing.

## 2. The stages and the acts

- [ ] 2.1 Fight a stage at the lowest difficulty with the character kits. Verify: a test named after the scenario "A stage is fought by four performers with Vigor", written first and seen failing.
- [ ] 2.2 Add the acts and the Battle Events. Verify: a test named after the scenario "A Battle Event offers a choice of two Alternate Cast members", written first and seen failing.
- [ ] 2.3 Add the paid events, with the Mystery Cache's Vigor. Verify: tests named after the scenarios "A Companion event costs Fantasia Flowers", "A paid event is refused without enough Fantasia Flowers" and "A Mystery Cache's option restores a character's Vigor".

## 3. The rewind, the star challenges and the other difficulties

- [ ] 3.1 Add the rewind, the rerolls, the star challenges and the other four difficulties. Verify: tests named after the scenarios "A rewind is refused once the run's rewinds are used", "Meeting an act's star challenge gives one Stella" and "A stage starts every member at full health and energy".

## 4. The Theater Lobby

- [ ] 4.1 Add the Theater Lobby once the Mondstadt Library's interior stands, and open the Theater at Adventure Rank 35. Verify: tests named after the scenarios "Reaching Adventure Rank 35 opens the Theater" and "Below Adventure Rank 35 the Theater stays closed".
