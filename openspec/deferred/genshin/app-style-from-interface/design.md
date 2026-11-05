# App Style From The Interface Package

**What it was.** The design style named Genshin, a third look beside standard and voxel, written by hand in the app's style map with its own palette, icons and loading rules. It was removed with the agent console that pinned it, because it was an approximation drawn beside the game's own interface, not drawn from it.

**Why deferred.** A style that copies the game's look can only drift from it, and the interface package already holds the game's own units, pointer and tokens. A faithful app style should read them, which needs the package to cover the controls the app's library draws: a button, a field, a dialog, a menu and a tab. Until it does, the only way to offer the look is to restate it, which is the copy that was removed.

**Revisit when:** the interface package's units cover the controls the app's UI library draws, so a design style can take its values from the package instead of restating them.

**Cheaper interim:** the standard style, and the Genshin page, which draws the game's own screens from the interface package.
