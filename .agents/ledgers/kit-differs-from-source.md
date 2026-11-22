# Kit differs from source

One row per character's kit overlay (`scripts/src/services/sweeps/ledgerCoverage/LedgerUnitsMap.ts`). Each row reads the overlay's entries against the Framework decisions bullets on `Unsourced`, `Unclassified` and `DiffersFromSource` in `openspec/specs/genshin/kits/README.md`, which is the rule a pass carries.

A kit's design is `openspec/specs/genshin/kits/<folder>/design.md`. The folder is the kit's own name or, where the kit is named differently, the one word of its name a folder bears (`arataki-itto` is `itto`, `kuki-shinobu` is `kuki`). No overlay names its design, so the name is the link, and `pnpm ai:sweep:kit-design` resolves every kit to exactly one folder.

```bash
kit=arataki-itto; d=openspec/specs/genshin/kits; pnpm ai:sweep:kit-design $kit
grep -n '"DiffersFromSource"' packages/genshin-world/src/data/kits/$kit.json
grep -n -i 'poise\|cooldown\|gauge\|area\|element' $d/<folder>/design.md
```

`pnpm ai:sweep:status` holds a kit open while its overlay still holds an `Unclassified` entry, whatever its trailer says.

| Unit        | Notes                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| `columbina` | her page's poise bullet names the deleted framework proposal's poise gap |
| `lisa`      | discharge hitmarks, hold multipliers: roadmap's gcsim reader items       |
| `tartaglia` | Melee Stance burst radius: roadmap's unread-shapes item                  |
