# Varka

Varka's kit is its record and one behaviour module, `createVarkaKitBehaviour`, avatar 10000128: five normal attacks, a charged attack of two hits, a collision and two plunges, his skill's hit, and the burst's two hits. Every skill and burst hit is Anemo, the burst's by gcsim's default, and his strikes are physical.

Proud skill groups give his skill and burst their talent multipliers; the table reads his cooldowns as 16 and 15 seconds, his energy cost as 60 and his charged stamina as 50.

gcsim sources: `varka/attack.go`, `charge.go`, `skill.go` and `burst.go`, with the table data in gcsim's Varka data file.

## Decisions

- **The burst's hits are Anemo.** gcsim makes the first hit the element of his conversion, which is Anemo while no Four Winds conversion stands, and the second Anemo. The record holds each as Anemo, the default it gives.
- **The skill and burst areas are the circles gcsim gives round his body.** The skill is a circle of 5 metres, and the burst is the circle of 7 metres offset 2 metres ahead, priced at 9 metres as the area holds no offset. The burst's area and its Wind element have no literal gcsim gives at the burst's own line, so both are `Unsourced` and the published values stand.

## Not built

- **Four Winds waits on the conversion hook.** A second press converts his skill into Four Winds, and the burst's first hit takes the element it converts to. The kit keeps no record of the conversion, so each hit is its Anemo hit alone.
- **His passives wait on their hooks.** Each one reads his Four Winds or the party's Elemental Resonance, so none is built.

## Key files

| File                                                             | Role                                                                                     |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/varkaKit.ts` | `createVarkaKitBehaviour`, Varka's module, built on his record and with no behaviour yet |
| `packages/genshin-world/src/data/kits/varka.json`                | Varka's overlay: the areas and elements gcsim leaves unnamed                             |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/varka), MIT: the timings of his strikes, his charged attack, skill, burst and elements, and his table data file.
