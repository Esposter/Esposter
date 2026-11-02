# Investigation

What was measured before the change was written, so the next session starts from the numbers and not from the conversation. Every figure is from the tree at the time of writing; the first task re-measures them as the baseline.

## The root today

- The session root (`packages/genshin-world/src/components/World/Session/Index.vue`) is 2,082 lines: a script of about 1,291 lines and a template of about 720 and a style block of 68. Its history: 2,130 lines before the overlay layers were cut out (`ec11aadcd`), 1,933 after the cut and further work, 2,082 after the five forwarding layers were inlined again (`cdc82001f`). The cut had grown the package by about 540 lines and held no state or logic.
- It declares 95 top-level constants, takes about 60 props (the loaded tables and the host's settings, from `WorldScreenProps` and `WorldTables`), and is mounted from one place, the world screen (`packages/genshin-world/src/components/World/Screen/Index.vue`).
- 51 composable calls take an options object, with 518 option keys in all. The calls are in the table below, largest first, with the keys that are shared context and whether the composable has a test beside it.
- 134 files in the composables folder, 25 of them tests. 21 of the 51 composables called from the root have a test.

## Which keys are shared context

The shared set is the data URL, the clock readers, the events emitter, the bag and wallet with their setters, the material data, the names, the text and the language. Counting them per key across the 51 calls:

| Key               | Calls that pass it |
| :---------------- | -----------------: |
| `gameDataBaseUrl` |                 22 |
| `events`          |                 20 |
| `getWorldNow`     |                 19 |
| `...bag`          |   10 (6 keys each) |
| `inventory`       |                  8 |
| `setWallet`       |                  7 |
| `wallet`          |                  7 |
| `gameText`        |                  6 |
| `materialDataMap` |                  6 |
| `setInventory`    |                  6 |
| `worldNow`        |                  5 |
| `language`        |                  5 |
| `names`           |                  4 |
| `nameText`        |                  3 |

That is 128 of the 518 keys, a quarter. Each `...bag` spread counts once here, and the ten spreads expand to six keys each on top of that. 38 of the 51 calls take at least one. 33 composables across the folder take the bag's setters. **The other three quarters are one feature's result given to another**, which no store of shared context removes; the dispatch, the frame and the interactables are mostly that.

## Every call

| Composable                    | Option keys | Shared keys | Test beside it |
| :---------------------------- | ----------: | ----------: | :------------- |
| `useWorldInteractionDispatch` |          53 |           1 | no             |
| `useWorldFrame`               |          41 |           1 | no             |
| `useWorldInteractables`       |          26 |           1 | no             |
| `useWorldDomains`             |          23 |           5 | yes            |
| `useWorldCommissionClaims`    |          20 |           8 | yes            |
| `useWorldChests`              |          17 |           4 | yes            |
| `useWorldCombat`              |          16 |           2 | yes            |
| `useWorldMap`                 |          16 |           5 | yes            |
| `useWorldOutcrops`            |          16 |           4 | yes            |
| `useWorldTalks`               |          15 |           4 | yes            |
| `useWorldTrounceBlossoms`     |          14 |           5 | yes            |
| `useWorldTrials`              |          13 |           2 | yes            |
| `useWorldFishing`             |          12 |           7 | no             |
| `useWorldQuestRewards`        |          12 |           7 | yes            |
| `useWorldReputationRequest`   |          12 |           1 | no             |
| `useWorldArchive`             |          11 |           4 | no             |
| `useWorldBagUse`              |          11 |           5 | no             |
| `useWorldMail`                |          11 |           9 | no             |
| `useWorldCommissions`         |          10 |           4 | yes            |
| `useWorldDoings`              |          10 |           0 | no             |
| `useWorldPickups`             |          10 |           5 | no             |
| `useWorldAdventureRank`       |           9 |           4 | yes            |
| `useWorldDevHandles`          |           9 |           0 | no             |
| `useWorldReputationBounty`    |           9 |           2 | no             |
| `useWorldStatues`             |           9 |           3 | no             |
| `useWorldAchievements`        |           8 |           6 | no             |
| `useWorldSpiralAbyss`         |           8 |           4 | yes            |
| `useWorldProfileNamecards`    |           7 |           2 | no             |
| `useWorldQuestTargets`        |           7 |           1 | no             |
| `useMiningOutcrops`           |           6 |           2 | yes            |
| `useWorldForging`             |           6 |           4 | no             |
| `useWorldHudFrame`            |           6 |           0 | no             |
| `useWorldOfferings`           |           6 |           3 | yes            |
| `useWorldPuzzles`             |           6 |           0 | yes            |
| `useWorldShrines`             |           6 |           3 | yes            |
| `useWorldCamera`              |           4 |           0 | no             |
| `useWorldCardGame`            |           4 |           1 | no             |
| `useWorldExpeditionRoster`    |           4 |           0 | no             |
| `useWorldHudVisibility`       |           4 |           0 | no             |
| `useWorldOculi`               |           4 |           1 | no             |
| `useWorldQuests`              |           4 |           3 | no             |
| `useWorldTips`                |           4 |           1 | yes            |
| `useMenuNavigation`           |           3 |           0 | no             |
| `useWorldRestorativePower`    |           3 |           1 | no             |
| `useWorldSave`                |           2 |           0 | yes            |
| `useWorldScreenBehaviour`     |           3 |           0 | no             |
| `useWorldGadgets`             |           2 |           2 | yes            |
| `useWorldPointedLandmark`     |           2 |           0 | no             |
| `useWorldSaveSync`            |           2 |           0 | yes            |
| `useWorldCooking`             |           1 |           1 | no             |
| `useWorldShortcutWheel`       |           1 |           0 | no             |

## Which features other features read

For each composable whose results the root destructures, the number of its results and the number of other calls that name one of them. These are the candidates for a store of their own, in the order a store pays most:

| Composable                                                                  | Results | Other calls that read them |
| :-------------------------------------------------------------------------- | ------: | -------------------------: |
| `useWorldSave`                                                              |      31 |                         21 |
| `useWorldClock`                                                             |       2 |                         17 |
| `useWorldScreen`                                                            |       2 |                         12 |
| `useWorldAdventureRank`                                                     |      11 |                         12 |
| `useWorldCombat`                                                            |      16 |                         12 |
| `useWorldQuests`                                                            |      13 |                         10 |
| `useWorldMap`                                                               |      12 |                          8 |
| `useWorldPickups`                                                           |      10 |                          7 |
| `useWorldPuzzles`                                                           |       8 |                          5 |
| `useWorldFishing`, `useWorldStatues`, `useWorldDomains`, `useWorldHudFrame` | 8 to 16 |                     4 each |
| `useWorldArchive`, `useWorldHomeRealm`, `useWorldChests`                    |  4 to 6 |                     3 each |

`useWorldSave`, the clock and the screen are the session's own: the save's systems, the time and what is open over the world. The adventure rank, the combat, the quests and the map are the first feature stores a later change would take. The measure is a name match on the destructured results, so it over-counts a name used for something else and under-counts a result read through an object; it ranks, it does not count exactly.

## The mailbox, as the first feature

- `useWorldMail` takes 11 keys, 9 of them shared context. It has no test.
- Its mails are part of the save: the root's save literal reads the mailbox's `mails` (a line in the save sync), and the Mail screen is a slot of the menu screen that reads the mailbox's rows, text and bag-full flag.
- It reads the clock once as the world starts, to deliver the Traveler's birthday mail and drop the expired mails, and writes the bag and wallet through the setters when a mail is claimed.

## Where the bag lives

`useWorldSave` creates the inventory and the wallet from the saved state, and its `setInventory` also emits the bag-change event and the obtain events through the session's emitter, so a store that owns the bag owns, or is handed, the emitter. `useWorldSave` has a test, as does `useWorldSaveSync`, which reads the root's refs to write the save.

## What the rules say, and where they disagreed

- The `vue` skill bans `provide`/`inject` by lint, and names a Pinia store as the way to share state. One `inject` is left in the root and Windrise, for the scene witness key, with a disable comment.
- The splitting guide said a long root is the integration root the form allows. The integration-root page said a root past a thousand lines is cut into layers. Both are now corrected: a layer is a cut only if it owns state, a composable, a style or logic, and the way to shrink a root whose weight is its options is to move the state they carry into stores.
- The checker's limit on events per component, which first shaped the menu layer's rejection, was a defect, was fixed, and played no part in the measurements.
- `genshin-world` does not list Pinia in its manifest. Its generated auto-import declarations do mention Pinia, which is to be checked: whether the build configuration still imports it, and whether the store lint rules reach this package.

## Per-frame state

- `useWorldFrame` (41 keys) runs before each draw from the canvas's before-loop hook. `hudFrame`, a reactive object the HUD child read, is written each frame. These change every frame and are read by the scene alone or by the HUD, so they stay out of a store.
- A store's refs are plain refs. The cost to avoid is reading through the store object in the frame path, and any subscription or patch there.

## The count, as a script

```js
// Run from the repository root: node count.cjs
// Parses the root's script with the repo's TypeScript, so a call counts whether its options open on the
// same line, on the next line, or after a multi-line destructure, and whether or not its result is assigned.
const fs = require("fs");
const ts = require(require.resolve("typescript", { paths: [process.cwd()] }));
const src = fs.readFileSync("packages/genshin-world/src/components/World/Session/Index.vue", "utf8");
const script = src.slice(0, src.indexOf("</script>")).replace(/^[\s\S]*?<script[^>]*>/, "");
const sf = ts.createSourceFile("Index.ts", script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const shared = new Set([
  "inventory",
  "wallet",
  "setInventory",
  "setWallet",
  "materialDataMap",
  "names",
  "nameText",
  "getWorldNow",
  "worldNow",
  "language",
  "gameDataBaseUrl",
  "events",
  "...bag",
  "gameText",
]);
const keys = [];
let calls = 0;
(function visit(node) {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    /^use\w+$/.test(node.expression.text) &&
    node.arguments[0] &&
    ts.isObjectLiteralExpression(node.arguments[0])
  ) {
    calls++;
    for (const p of node.arguments[0].properties)
      keys.push(ts.isSpreadAssignment(p) ? "..." + p.expression.getText(sf) : p.name.getText(sf));
  }
  ts.forEachChild(node, visit);
})(sf);
console.log(calls, keys.length, keys.filter((k) => shared.has(k)).length);
```

It prints `51 518 128` on the tree at the time of writing. The change's outcomes are stated against it.

## After the bag and the context moved (task 2.2)

The same script prints `49 390 0`: 49 calls with an options object, 390 option keys in all, and no shared key in any of them (from `51 518 128`). The root is 1,943 lines (from 2,082) and the package's chunk 2 netted about 450 lines fewer (65 files). The four composables that took the data URL as a lone argument (`useWorldConstellations`, `useWorldDishes`, `useWorldFriendship`, `useWorldCooking`) read it from the store too, which the script does not count.

## After the mailbox (tasks 3.1 and 3.2)

The script prints `48 388 0`. The mailbox is `src/store/mail.ts` and its page `components/World/Mail/Index.vue`, and the root is 1,918 lines (from 1,943). The mailbox alone adds lines (191 added, 69 removed over its four files, 99 of them the store's test and 36 the page), as a first feature store carrying its test and its page does; the gate in task 4.1 counts the whole slice.
