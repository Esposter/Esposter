# Prune

Prune's kit is its record and one behaviour module, `createPruneKitBehaviour`, avatar 10000132: her normal attacks, charged attack, collision and plunges, her skill's Ring-A-Ding-Ding press, and the burst's initial hit. Her skill and burst are Anemo.

Her skill and burst are read from proud skill groups 13232 and 13239 as their talent multipliers. Her cooldowns and energy cost are read from the table: 15 seconds for the skill, 18 seconds for the burst and 70 energy.

gcsim sources: Prune's attack, charge, skill and burst files, with the table data in gcsim's Prune data file.

## Decisions

- **The skill and burst's hitboxes are circles by hand.** The skill's press is a circle of 2.5 metres offset 1.4 metres ahead, priced at 3.9 metres, and the burst's initial hit is a circle of 6.5 metres. gcsim names neither in a form the builder matches, so each is recorded by hand, and Prune's overlay names no cause for either hitbox's geometry.

## Not built

- **The Clang Clang convert waits on the convert hook.** A second press of her skill converts it into Clang Clang! Witch-tribution Comes!, a hit that needs the state the press left behind. The kit holds the press alone.
- **The Witchlure Bell DoT waits on the burst's ticks.** The burst's ticks and its detection area are scheduled after the initial hit, which no kit reads yet, so the burst is its initial hit alone.
- **Her passives wait on their hooks.** Each reads her convert state, her burst's bell or the party's Elemental Resonance, so none is built.

## Key files

| File                                                             | Role                                                                                             |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/pruneKit.ts` | `createPruneKitBehaviour`, Prune's module, which reads her record alone for now                  |
| `packages/genshin-world/src/data/kits/prune.json`                | Prune's overlay: the skill and burst's hits, which the record's hitmark and hitboxes do not give |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/prune), MIT: her attacks' hitmarks and cancels, the skill's press and convert, the burst's initial hit and DoT, and her table data file.
