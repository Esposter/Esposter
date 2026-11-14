# Co-op

The game's Co-Op Mode, open from Adventure Rank 16, lets up to four players share one host's world: exploring it together, clearing domains and bosses as a party, each player with one or two characters on the field. Around it sit the friends list it is joined through, visits to a friend's Serenitea Pot, Genius Invokation duels between players, and the Imaginarium Theater's Supporting Cast, characters friends lend each other.

**Why deferred:** a signed-in player's progress is one save on the server, leased to one session at a time ([save data](../../../specs/genshin/save-data/design.md)), but the world itself runs in that one browser, the daily reset is the player's own 04:00 ([reset clock](../../../specs/genshin/reset-clock/design.md)), and the world is the person's own, which the [Genshin](../../../changes/genshin-program/design.md) proposal sets out of scope for multiplayer. Co-op needs a host's world held somewhere guests can reach it while it runs, the host's state authoritative over every guest's actions, and each action relayed between players as it happens: a live host, and other players to meet on it.

**Revisit when:** a second session can act in a host's running world, so the server holds that world's state between actions and a host's world exists for a guest to join. The app's realtime objects, whose hibernating WebSockets carry every live update today, are then the first transport to price for relaying a party's actions.

**Cheaper interim:** none is needed. Every system the world proposes is built for one player, as the game itself plays outside co-op.

## Sources

- [Co-Op Mode](https://genshin-impact.fandom.com/wiki/Co-Op_Mode), Genshin Impact Wiki: the unlock at rank 16, up to four players in a host's world and their characters each.
- [Serenitea Pot](https://genshin-impact.fandom.com/wiki/Serenitea_Pot), [Genius Invokation TCG](https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG) and [Imaginarium Theater](https://genshin-impact.fandom.com/wiki/Imaginarium_Theater), Genshin Impact Wiki: visits to a friend's realm, duels between players, and the Supporting Cast lent by friends.
