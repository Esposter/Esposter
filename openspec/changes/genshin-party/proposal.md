# Party

## Why

The party's teams, switching and the Resonance effects built so far are shipped, but Party Setup is still a placeholder, the next member and the revive are chosen by the world rather than the player, and the party is not kept between visits. The player needs the screen and the choices the game gives, and the Resonance effects that wait on mechanisms need those mechanisms built.

## What Changes

Party Setup opens as a screen of its own, the player chooses the next member after a fall, and the party is kept between visits.

- Party Setup opens on L and from the Paimon menu, showing the deployed team slot by slot, with arrows that step between teams.
- Configure Team adds, renames and disbands teams, and Quick Setup fills a team's slots in order.
- **BREAKING** After the member on the field falls, the player chooses the next member instead of the world bringing the next standing member in slot order, and the game over screen offers a revive at the nearest teleport waypoint with 35% HP in place of the statue's revive.
- The party's teams, deployed team, member on the field and each member's down state are kept between visits, by the account and the browser.
- Afflictions on a party member under a matching Resonance last 40% less time, High Voltage drops an Electro particle on listed reactions on a five-second cooldown, and a Moondrift gives the team a shield's damage and Geo resistance.

## Capabilities

- **genshin/party** (modified)

## Waiting on

- Afflictions: party members hold no elemental state and enemies' strikes apply none to them, so the resonances must reach element application first.
- High Voltage's particle: no reaction gives energy yet, and no cooldown is kept for the team.
- Moondrift: Moonsign is not built.
- Sprawling Greenery's Hyperbloom and Burgeon: no strike triggers them yet.

## Impact

The L screen and the Paimon menu's Party Setup, the deployed team shown on the HUD, the party kept in the save between visits, the choice of the next member and the revive after a fall, and the afflictions, particles and shields of the Resonance effects.

Size kept as the source page's own: splitting it is a later decision.
