# Investigation

The rule that caps the investigation spots a player may investigate in a game day: a hundred, after which no more spawn. Nothing places the spots or gives a reward yet, so the cap is the only part built, and the [proposal](../../../changes/genshin-gathering/design.md) keeps the rest.

## How it works

```mermaid
flowchart TD
  I["The day's investigation instants"] --> C["countInvestigationsToday: those at or after the daily reset"]
  C --> K{"checkIsInvestigationSpawning: under the cap of a hundred"}
  K -->|"yes"| S["More spots spawn"]
  K -->|"no"| N["No more spawn until the game day's reset"]
```

## Rules

- **A hundred a day.** `INVESTIGATION_DAILY_CAP` is the most investigations in one game day. At the cap, no more spots spawn; below it, they do.
- **The count is the game day's.** The game day starts at the daily reset, 04:00 in the game's time zone, so the count that the cap compares is the one kept from that reset. `countInvestigationsToday` counts the investigations made at or after the latest reset, read from the shops' `computeShopRefreshTime` daily refresh, so the game day is the one the shops, the resin and the forge keep and not a second reset. The store that keeps the instants it is handed is not built.

## Key files

| File                                                                                | Role                                                      |
| :---------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| `packages/genshin-world/src/services/investigation/constants.ts`                    | The daily cap of investigations                           |
| `packages/genshin-world/src/services/investigation/checkIsInvestigationSpawning.ts` | Whether spots still spawn after this many in the game day |
| `packages/genshin-world/src/services/investigation/countInvestigationsToday.ts`     | The investigations made since the latest daily reset      |

## Sources

- [Investigation](https://genshin-impact.fandom.com/wiki/Investigation), Genshin Impact Wiki: spots that give artifacts, ingredients, ores or Mora, and the daily cap of a hundred investigations.
- [Daily Reset](https://genshin-impact.fandom.com/wiki/Daily_Reset), Genshin Impact Wiki: what comes back at the daily reset and around it.
