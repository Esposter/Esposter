# Persona roster

The character data every pick, card and verb reads, kept by a dependency Renovate bumps and cached once per installed version.

## The roster is a dependency

The game-data package the community maintains under MIT ships every playable character as bundled JSON — name, title, element, region, birthday, affiliation, weapon, constellation and the patch that introduced them — and follows each game patch within days. The hook loads that package from the plugin's own installed dependencies through `require`, rather than a static import, so a missing install fails inside the script, where the process-level handler catches it, instead of at link time before anything has run. There is no generated roster, no generator, and no test that the two agree.

Loading that package is almost the whole cost of a start — the better part of a second, against milliseconds for the query it then answers — so the roster is read once per installed version and kept in the state directory, which takes a warm start down to a fraction of that. The cache's file name carries the version off the data package's own manifest, so a bump invalidates it by itself and a write prunes every other version's copy: nothing is generated, nothing is checked in, and no step is added to the bump.

A character with no card is fully usable — the data alone is a persona — which is what makes "every playable character" a property of the dependency rather than a backlog.

## Key files

| File                                                  | Role                                                                                                                   |
| :---------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-persona/src/services/readRoster.ts` | The identity records and the localized ones, matched on the package's id and cached under the version and the language |
