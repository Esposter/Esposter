# Weapon assets

## Why

The recreation draws no weapon. The weapon table is built and the weapon screen draws its text, but no blade is held, no strike leaves a trail, no dropped item is a weapon, and every weapon tile and the screen's portrait is a placeholder. The game's weapon art cannot ship, so the family has to be converted the way the other asset families are: measured from the install and its footage, and published as our own parameters only.

## What Changes

- The weapons become a derived-assets family with a conversion recipe that runs from the game's install.
- Each weapon's icon is traced to an outline, published as parameters, and drawn on its inventory tile and on the weapon screen's portrait.
- A held weapon's blade is fitted from the game's mesh, placed at the hand by a fitted grip, and dropped as its own shape.
- A strike's trail is measured from the game's recorded strikes and drawn as a ribbon.
- One sword attack clip plays on the body, through the clip retarget.

## Capabilities

- **weapon-assets** (new): the weapon art the recreation draws from fitted parameters, and the rule that no weapon art of the game ships.

## Waiting on

The attack clip task waits on [the Traveler's skeleton item](../genshin-roadmap/tasks.md) in the roadmap, which retargets the game's clips onto the body.

## Impact

- The derived assets' weapons component, its fit map, a weapon icon export, and one new dataset member for the weapons' shapes.
- The inventory tiles, the weapon screen, the world's drops and the character's held weapon.
- Game-reading steps run on the Windows PC. The Mac holds the same install, but its AnimeStudio build has no recorded acceptance, so its exports are not taken as the PC's.
- The task list is longer than the change rules' twelve. It stays one change because it is one family's recipe, and splitting it would scatter the family's Key files over several changes.
