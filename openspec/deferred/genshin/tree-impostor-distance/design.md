# Tree impostor distance

The [trees and scatter](../../../changes/genshin-trees-and-scatter/design.md) page decides a tree's cross-over from its mesh to its impostor per instance. The distance that cross-over sits at is the one the game itself uses, the distance at which one of its own trees changes its detail. That distance is what this idea measures, and it is not measured yet.

**Why deferred:** the distance is read off a recording that backs away from one of the game's trees, and no such recording is held. A cross-over set without it would fit the impostor to a guess rather than to the game.

**Revisit when:** a recording that backs away from one of the game's trees is in hand, so the distance at which it changes detail can be read off it.

**Cheaper interim:** the cross-over the trees and scatter page already decides per instance, at a distance set by hand.
