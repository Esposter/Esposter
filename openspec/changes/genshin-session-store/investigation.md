# Investigation

What was measured before the change was written, so the next session starts from the numbers and not from the conversation. Every figure is from the tree at the time of writing; the first task re-measures them as the baseline.

## The root today

- The session root (`packages/genshin-world/src/components/World/Session/Index.vue`) is 2,082 lines: a script of about 1,291 lines and a template of about 720 and a style block of 68. Its history: 2,130 lines before the overlay layers were cut out (`ec11aadcd`), 1,933 after the cut and further work, 2,082 after the five forwarding layers were inlined again (`cdc82001f`). The cut had grown the package by about 540 lines and held no state or logic.
- It declares 95 top-level constants, takes about 60 props (the loaded tables and the host's settings, from `WorldScreenProps` and `WorldTables`), and is mounted from one place, the world screen (`packages/genshin-world/src/components/World/Screen/Index.vue`).
- 46 composable calls take an options object, with 445 option keys in all. The calls are in the table below, largest first, with the keys that are shared context and whether the composable has a test beside it.
- 134 files in the composables folder, 25 of them tests. 18 of the 46 composables called from the root have a test.

## Which keys are shared context

The shared set is the data URL, the clock readers, the events emitter, the bag and wallet with their setters, the material data, the names, the text and the language. Counting them per key across the 46 calls:

| Key                 | Calls that pass it |
| :------------------ | -----------------: |
| `gameDataBaseUrl`   |                 19 |
| `getWorldNow`       |                 17 |
| `events`            |                 17 |
| `...bag`            |    9 (6 keys each) |
| `inventory`         |                  7 |
| `setWallet`         |                  6 |
| `wallet`            |                  6 |
| `gameText`          |                  6 |
| `materialDataMap`   |                  5 |
| `setInventory`      |                  5 |
| `worldNow`          |                  4 |
| `language`          |                  4 |
| `names`, `nameText` |             3 each |

That is 111 of the 445 keys, a quarter, with the ten `...bag` spreads on top of it. 32 of the 46 calls take at least one. 33 composables across the folder take the bag's setters. **The other three quarters are one feature's result given to another**, which no store of shared context removes; the dispatch, the frame and the interactables are mostly that.

## Every call

| Composable                    | Option keys | Shared keys | Test beside it |
| :---------------------------- | ----------: | ----------: | :------------- |
| `useWorldInteractionDispatch` |          53 |           1 | no             |
| `useWorldFrame`               |          41 |           1 | no             |
| `useWorldInteractables`       |          26 |           1 | no             |
| `useWorldDomains`             |          23 |           5 | yes            |
| `useWorldChests`              |          17 |           4 | yes            |
| `useWorldCombat`              |          16 |           2 | yes            |
| `useWorldMap`                 |          16 |           5 | yes            |
| `useWorldOutcrops`            |          16 |           4 | yes            |
| `useWorldTalks`               |          15 |           4 | yes            |
| `useWorldTrounceBlossoms`     |          14 |           5 | yes            |
| `useWorldFishing`             |          12 |           7 | no             |
| `useWorldQuestRewards`        |          12 |           7 | yes            |
| `useWorldReputationRequest`   |          12 |           1 | no             |
| `useWorldArchive`             |          11 |           4 | no             |
| `useWorldMail`                |          11 |           9 | no             |
| `useWorldBagUse`              |          11 |           5 | no             |
| `useWorldCommissions`         |          10 |           4 | yes            |
| `useWorldPickups`             |          10 |           5 | no             |
| `useWorldDoings`              |          10 |           0 | no             |
| `useWorldAdventureRank`       |           9 |           4 | yes            |
| `useWorldStatues`             |           9 |           3 | no             |
| `useWorldAchievements`        |           8 |           6 | no             |
| `useWorldSpiralAbyss`         |           8 |           4 | yes            |
| `useWorldProfileNamecards`    |           7 |           2 | no             |
| `useWorldQuestTargets`        |           7 |           1 | no             |
| `useWorldPuzzles`             |           6 |           0 | yes            |
| `useWorldShrines`             |           6 |           3 | yes            |
| `useWorldOfferings`           |           6 |           3 | yes            |
| `useWorldForging`             |           6 |           4 | no             |
| `useMiningOutcrops`           |           6 |           2 | yes            |
| `useWorldHudFrame`            |           6 |           0 | no             |
| `useWorldCardGame`            |           4 |           1 | no             |
| `useWorldOculi`               |           4 |           1 | no             |
| `useWorldExpeditionRoster`    |           4 |           0 | no             |
| `useWorldHudVisibility`       |           4 |           0 | no             |
| `useWorldCamera`              |           4 |           0 | no             |
| `useWorldRestorativePower`    |           3 |           1 | no             |
| `useWorldGadgets`             |           2 |           2 | yes            |
| `useWorldSave`                |           0 |           0 | yes            |
| `useWorldTips`                |           0 |           0 | yes            |
| `useWorldQuests`              |           0 |           0 | no             |
| `useWorldScreenBehaviour`     |           0 |           0 | no             |
| `useMenuNavigation`           |           0 |           0 | no             |
| `useWorldCooking`             |           0 |           0 | no             |
| `useWorldShortcutWheel`       |           0 |           0 | no             |
| `useWorldPointedLandmark`     |           0 |           0 | no             |

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

```python
import re
s = open("packages/genshin-world/src/components/World/Session/Index.vue").read().split("</script>")[0]
shared = {"inventory", "wallet", "setInventory", "setWallet", "materialDataMap", "names", "nameText",
          "getWorldNow", "worldNow", "language", "gameDataBaseUrl", "events", "...bag", "gameText"}
total = hit = calls = 0
for m in re.finditer(r"= (use\w+)\(\{", s):
    i = m.end(); depth = 1; j = i
    while depth and j < len(s):
        depth += (s[j] == "{") - (s[j] == "}"); j += 1
    keys = [re.match(r"^  (\.\.\.\w+|\w+)", l).group(1) for l in s[i:j-1].split("\n") if re.match(r"^  (\.\.\.\w+|\w+)", l)]
    calls += 1; total += len(keys); hit += sum(k in shared for k in keys)
print(calls, total, hit)
```

It prints `46 445 111` on the tree at the time of writing. The change's outcomes are stated against it.
