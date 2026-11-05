# Interface art: items, icons and ornaments

## Why

The recreation's screens draw item icons, portraits, card faces, stat icons, emblems and ornaments from our own shapes, and most of the game's pictures among them are still missing. Each screen's roadmap line names its own gap, but no page says how a kind of art is closed in general: which kinds a trace of a reference frame closes, which a fitted colour stands in for, and which cannot ship. Without that, each screen picks its own method, and a picture gets traced where it should be a stand-in with a recorded gap.

## What Changes

- The family's gap table links each missing piece to the roadmap line that names it, rather than repeating those lines.
- The conversion path for each kind of art follows the derived-assets recipe's order, and each step is either a command that exists or a step that has none.
- Pictures that cannot ship are listed with the stand-in each keeps and the roadmap line that records it.
- The commands and shared pieces no roadmap line owns become tasks: a named-icon export, a trace written in reference pixels, a tone split for any icon, a picture's mean colour, an item tile art place, and the roadmap lines no line yet names.

## Capabilities

- **genshin/interface-art** (new): which method closes each kind of interface art, and what a player sees where a picture cannot ship.

## Waiting on

None.

## Impact

The asset tooling in `scripts` (the trace command, a named-icon export, a picture's colour fit), the shared item tile in `genshin-interface`, two components in `genshin-world` for a trace each, and the roadmap for the lines it lacks. No game art is committed, published or shipped by any task.
