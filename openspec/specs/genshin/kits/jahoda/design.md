# Jahoda

Jahoda's kit is its record and one behaviour module, `createJahodaKitBehaviour`, avatar 10000124: three strikes, a fully charged shot, a collision and two plunges, Savvy Strategy's pursuit with its flask and drains, and Hidden Aces' first hit. Her multipliers are read from proud skill groups 12431, 12432 and 12439; the flask's fill, the skill's cooldown, the burst's cooldown and its energy cost are read from the same groups.

## Decisions

- **Savvy Strategy's cooldown starts when she presses it, and gcsim's starts when the flask drains.** gcsim sets the cooldown at the drain plus the windup's 30 frames, which can be up to 334 frames after the press; the framework starts a skill's cooldown at its press. The 15 seconds from the table are shipped from the press, as the framework gives it. Settled by the roadmap's question on the cooldown.
- **Jahoda's poise is zero on every hit.** gcsim gives her strikes, charged shot, flask hits and plunges no poise, and no other source does, so none is dealt until one does. Settled by the roadmap's question on poise.
- **Her plunges take the shared reach at Bennett's timings.** gcsim has no plunge file for Jahoda, so the collision, low and high plunges borrow the shared reach and land at once, as the framework gives a kit without one. Settled by the roadmap's question on the plunges.
- **The flask's absorb reads the first element in the framework's order, not in gcsim's.** gcsim checks the element the flask has already absorbed before the others; the framework's absorb check reads its own fixed order. The two agree while an enemy holds one element's aura; they differ only when an enemy holds two.
- **The second press's drain is a summon, not a hit of the press.** Whether the drain is a filled or an unfilled hit depends on the gauge when the press lands, which an action's own hit list cannot choose between. The summon is cast where she stands and lands 2 frames after the press when the gauge is full, or 4 frames after it when not, gcsim's frames.

## Not yet built

- **Her robots, which absorb an aura and strike the three nearest enemies, and Meowball.** Both exist only at Moonsign level 2 and above (gcsim's `GetMoonsignLevel() >= 2`), and the kit's Moonsign is not read yet. They wait on the Moonsign hook.
- **Hidden Aces' heal ticks, the party's heals every 87 frames for the burst's 790 frames.** The framework's heals are carried by a hit, and no timed heal of the party runs on a field's clock. They wait on a timed party heal hook.
- **Ascension 1 and 4, and Constellations 1, 2, 4 and 6.** Ascension 1 scales the burst's damage and heal by the party's elements, Ascension 4 adds Elemental Mastery while she heals above 70% HP, Constellation 1 bounces Meowball, Constellation 2 and 4 read the party's elements and the robots' absorbs, and Constellation 6 is Meowball at Moonsign level 2. They wait on the Moonsign hook and on the party's element counts, which no passive reads yet.

## Key files

| File                                                              | Role                                                                                                                                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/jahodaKit.ts` | `createJahodaKitBehaviour`, Jahoda's kit with her strikes, charged shot, plunges, Savvy Strategy's pursuit and flask drains, and Hidden Aces' first hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/jahoda), MIT: her normal attacks' hitmarks and cancel windows, the charged shot's frames, Hidden Aces' frames, Savvy Strategy's windup, pursuit, fill, drains and cooldown, and the robots and heals the page lists as not yet built.
