# Character screen

## Why

The character screen's frame, its six tabs, the Attributes, Weapons, Artifacts, Constellation and Talents panels, and the Profile tab's stories are built. The screen does not yet show the chosen character's model, its full list of attributes, or its levelling and ascension, and its look still uses provisional values where the game's measured ones are owed. Each of these is a player-visible part of the screen the game has.

## What Changes

The character screen shows the chosen character as the game does and lets the player level and ascend it.

- The chosen character's model stands in the middle of the screen over a background that matches its element.
- The element's mark shows at the top left, and the Traveler's shows its alignment's.
- Details opens every attribute past the summary, in the game's three groups.
- Level Up spends Character EXP materials; Ascend spends materials and Mora at a phase's cap once the Adventure Rank allows it.
- Past level 90, Masterless Stella Fortuna lifts a character to level 95 and then 100.
- The Profile tab lists the character's voice-over lines and shows its namecard.
- Resonating with a Statue of The Seven gives the Traveler that element, and each element resonated with adds a bonus.
- The frame's places, sizes and colours are measured from the game's own screen, not provisional.

## Capabilities

- **genshin/character-screen** (modified)

## Waiting on

- `openspec/changes/genshin-characters/`: the character's model, which stands in the screen's middle.
- `openspec/changes/genshin-inventory/`: the materials Level Up and Ascend spend.
- Game install and game exports, which the screen's references and tables need.

## Impact

- The character screen in the Genshin world and the interface frame behind it, the Profile tab, and the character's level and ascension.
- The parity tooling that fits and scores the screen's look against the game.

Size kept as the source page's own: splitting it is a later decision.
