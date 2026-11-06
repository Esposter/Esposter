# Training Guide

The game's Training Guide screen, titled by the game's text key `UI_TRAININGGUIDE_TITLE`. The wiki's list of the Paimon menu's contents names it, but no still of the menu draws it, and no reference of the screen itself has been captured, so the world has no screen kind for it: the kind, its opener and its behaviour are not in the code.

**Why deferred:** a recreation is matched against a reference, and the parity gate cannot pass a screen no reference shows. Its way in is unknown for the same reason: the [Paimon menu](../../../specs/genshin/paimon-menu/design.md) leaves it out of the contents its stills show, and no other opener is recorded, so there is no entry or shortcut to build against.

**Revisit when:** a reference of the screen exists in the parity snapshots, showing the screen and the way the player reaches it. Then the screen kind returns to `ScreenKind` with its opener in `ScreenKindOpenerMap`, its behaviour in `ScreenBehaviourMap` and its title from the text key, and the reachability check names it until its opener holds ([screens](../../../specs/genshin/screens/design.md)).

**Until then:** the title's text key stays in the game text, since the character screen's foot already draws its label (`packages/genshin-world/src/components/Character/Screen/Foot/Index.vue`). Nothing else of the screen is built.
