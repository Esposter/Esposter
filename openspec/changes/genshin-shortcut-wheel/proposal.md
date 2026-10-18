# Shortcut Wheel

## Why

The Shortcut Wheel is how a player reaches the game's menus and screens without opening the Paimon menu: holding Tab on a keyboard or the left bumper on a pad opens a wheel of eight or four entries, and releasing on one opens its screen. The engine already binds the input, but nothing in the world reads it, so the key does nothing.

## What Changes

- Holding Tab, or the left bumper, opens the wheel with its entries around the centre.
- The wheel shows the game's default entries: eight in the 8-direction layout, four in the 4-direction one, in the order the wiki gives.
- The direction the pointer or stick points toward picks its entry, and releasing on an entry opens that entry's screen.

## Capabilities

- **genshin/shortcut-wheel** (new)

## Waiting on

- The wheel's glyphs and layout, which the parity loop traces from the game's own still; until then the component is not drawn.
- Customizing the entries and the direction count from Settings, which the wiki gates on Adventure Rank 20. The defaults are built now, and the customization is a later change.
- Gadgets are not on the wiki's wheel, so the quick-use slots of `genshin-gadgets` stay on Z and are not added here.

## Impact

Adds `packages/genshin-world/src/services/shortcutWheel/`, whose entries and direction are pure and tested, and the component that draws the wheel once its layout is traced.
