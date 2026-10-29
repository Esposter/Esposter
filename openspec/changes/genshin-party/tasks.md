## 1. Party Setup screen

- [x] 1.1 Build Party Setup from the clip's frames: draw the deployed team, arrows, slots, Deploy and Quick Setup, and fill the menu's Party Setup slot with it. Configure Team is a disc whose frame shows an icon and no word, so the screen draws no word on it. Verify: its still is cut by hand from the clip and named in `ParityReferenceMap` by `source`, and a test named after the scenario 'Party Setup opens showing the deployed team' passes.
- [x] 1.2 Make Deploy bring a standing member onto the field and refuse a team with nobody standing. Verify: tests named after the scenarios 'Deploying a team with a standing member puts that member on the field' and 'Deploying a team with nobody standing is refused', written first and seen failing.
- [x] 1.3 Add Configure Team's add, rename and disband within fifteen teams, and keep the deployed team. Verify: tests named after the scenarios 'A sixteenth team is refused' and 'The deployed team cannot be disbanded'.
- [x] 1.4 Make Quick Setup fill empty slots in order. Verify: a test named after the scenario 'Quick Setup fills the four slots in order'.

## 2. Falls and game over

- [x] 2.1 Lock switching while a fall plays, and ask the player for the next member when it ends. The HUD prompt is wired: `Hud/Party/Index.vue` shows it from `checkIsNextMemberAsked`, and `Character/Index.vue` steps the fall each fixed step with `stepPartyFall`. Verify: tests named after the scenarios 'Switching is locked while the fall plays' and 'The player chooses the next member after a fall'.
- [x] 2.2 Replace the statue's revive with the game over screen's revive at the nearest waypoint. The game over screen is built (`components/GameOver/Index.vue`): the session opens it once the whole team has fallen, its Revive runs `reviveFallenParty`, as [party](../../specs/genshin/party/design.md) gives. Verify: the test 'game over offers revive at the nearest waypoint' in `useWorldCombat.test.ts`, which passes. A domain's challenge revives without the screen, as [party](../../specs/genshin/party/design.md) gives.

## 3. Memory

- [x] 3.1 Keep the party between visits, in the account and the browser. Verify: a test named after the scenario 'The deployed team and member on field return after a visit'.

## 4. Resonance effects waiting on mechanisms

- [x] 4.1 Shorten afflictions under the matching Resonance, once resonances reach element application. Verify: a test named after the scenario 'Fervent Flames shortens a Cryo affliction on a member'.
- [x] 4.2 Drop High Voltage's particle on a five-second cooldown, once reactions give energy and the team keeps a cooldown. Verify: tests named after the scenarios 'A listed reaction drops a particle once the cooldown has passed' and 'A reaction within the cooldown drops no particle'.
- [x] 4.3 Give a Moondrift the shield's defence, once Moonsign is built. Verify: a test named after the scenario 'A Moondrift formed nearby gives a shield's defence'.

## 5. Enemy attack elements

- [ ] 5.1 Author each enemy kind's attack element from its wiki Attacks section, once a placed kind has an elemental attack, so a landed strike applies it to the struck member. No kind in EnemyKindTraitsMap sets `attackElement` yet (the branch in `strikePartyMember` runs only under a test's override), and Hilichurl Fighter's attacks are all Physical. Verify: a test named after the scenario 'An enemy kind with an elemental attack applies it to the struck member' passes against the authored kind, not an override.

## 6. Application's aura decay scale

- [x] 6.1 Settle the shape of `auraDecayRateScale`: a required number on the four `applyElement` callers, or left out of `ElementApplication` where every application is 1 or above. Today an omitted scale and a scale of 1 mean the same thing, which `applyElement` defaults to 1 and the absent-values rule does not allow. Verify: the `applyElement` aura decay tests pin the chosen shape, and no optional field keeps the identity default.
