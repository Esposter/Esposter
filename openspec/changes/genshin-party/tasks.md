## 1. Party Setup screen

- [x] 1.1 Build Party Setup from the clip's frames: draw the deployed team, arrows, slots, Deploy, Configure Team and Quick Setup, and fill the menu's Party Setup slot with it. Verify: the 57-second clip is framed with `genshin:parity frames`, its reference frame is taken with `genshin:parity frame <capture> --at <s> --name party-setup`, and a test named after the scenario 'Party Setup opens showing the deployed team' passes.
- [x] 1.2 Make Deploy bring a standing member onto the field and refuse a team with nobody standing. Verify: tests named after the scenarios 'Deploying a team with a standing member puts that member on the field' and 'Deploying a team with nobody standing is refused', written first and seen failing.
- [x] 1.3 Add Configure Team's add, rename and disband within fifteen teams, and keep the deployed team. Verify: tests named after the scenarios 'A sixteenth team is refused' and 'The deployed team cannot be disbanded'.
- [x] 1.4 Make Quick Setup fill empty slots in order. Verify: a test named after the scenario 'Quick Setup fills the four slots in order'.

## 2. Falls and game over

- [x] 2.1 Lock switching while a fall plays, and ask the player for the next member when it ends. Verify: tests named after the scenarios 'Switching is locked while the fall plays' and 'The player chooses the next member after a fall'.
- [x] 2.2 Replace the statue's revive with the game over screen's revive at the nearest waypoint. Verify: a test named after the scenario 'Game over offers revive at the nearest waypoint'.

## 3. Memory

- [x] 3.1 Keep the party between visits, in the account and the browser. Verify: a test named after the scenario 'The deployed team and member on field return after a visit'.

## 4. Resonance effects waiting on mechanisms

- [x] 4.1 Shorten afflictions under the matching Resonance, once resonances reach element application. Verify: a test named after the scenario 'Fervent Flames shortens a Cryo affliction on a member'.
- [x] 4.2 Drop High Voltage's particle on a five-second cooldown, once reactions give energy and the team keeps a cooldown. Verify: tests named after the scenarios 'A listed reaction drops a particle once the cooldown has passed' and 'A reaction within the cooldown drops no particle'.
- [x] 4.3 Give a Moondrift the shield's defence, once Moonsign is built. Verify: a test named after the scenario 'A Moondrift formed nearby gives a shield's defence'.
