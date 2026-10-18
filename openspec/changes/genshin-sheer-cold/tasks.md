## 1. The gauge

- [x] 1.1 Hold the climate's area list and tell the area the character stands in. Verify: a test named after the scenario 'Hold Dragonspine's sheer cold' written first and seen failing.
- [x] 1.2 Heat the character from a lit campfire within reach and from nothing else. Verify: a test named after the scenario 'Heat the character beside a lit campfire' written first and seen failing.
- [x] 1.3 Step the gauge: fill in the climate, faster while swimming, drain near heat wherever it stands and drain elsewhere, and keep it between none and its maximum. Verify: a test named after the scenario 'Fill the gauge in the subzero climate' written first and seen failing.
- [x] 1.4 Deal the share of max HP and the flat amount for each second the gauge stays full, carrying the time short of the next. Verify: a test named after the scenario 'Deal its share of damage for each interval it stays full' written first and seen failing.

## 2. The bar and the wiring

- [x] 2.1 Step the gauge each frame where the character stands in Windrise, emitting its value and any damage, and write the value into the HUD frame from the session. Verify: checked by eye at integration; the loop composable has no unit test, and the rules it calls are tested.
- [x] 2.2 Show the bar across the top of the screen while the gauge holds cold, filled by its value. Verify: checked by eye at integration against the game's bar; its placement and colours are provisional.

## 3. Left open

- [x] 3.1 Apply the cold damage to the party's HP through the team's shields, as a boar's charge is taken. Verify: a test named after the scenario 'Lose the share of max HP each interval' written first and seen failing; `hitPartyMember.test.ts` 'should lose the share of max HP the shields do not absorb'.
- [ ] 3.2 Place campfires in the world, so the lit ones heat the character. Waits on campfire placement, which the cooking rules do not yet do. Verify: a test named after the scenario 'Heat the character beside a lit campfire' runs against a placed campfire.
- [ ] 3.3 Let a snowstorm quicken the fill. Waits on a snowstorm in `WeatherKind`, which holds only Snow. Verify: a test named after the scenario 'Fill the gauge faster in a snowstorm' written first and seen failing.
- [ ] 3.4 Read the bar's placement, its look and the heat's reach off a recording, replacing the provisional constants. Waits on the recording. Verify: checked by eye against the recording.
- [x] 3.5 Name the gauge in the reader's text with a `GameTextKey` member, `SheerCold` (text `694190546`), and label the bar with it. Verify: the bar's label reads the member; the per-language check waits on the coordinator's `genshin:text write`, which this change does not run.
- [ ] 3.6 Let an anti-cold dish suppress the fill, by the ratios the dump's anti-cold food buffs give. Waits on the food's effect reaching the gauge. Verify: a test named after the scenario 'Suppress the fill with an anti-cold dish' written first and seen failing.
