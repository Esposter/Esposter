# Jahoda

Jahoda's kit is its record and one behaviour module, `createJahodaKitBehaviour`, avatar 10000124: three strikes, a fully charged shot, a collision and two plunges, Savvy Strategy's pursuit with its flask and drains, and Hidden Aces' first hit. Her multipliers are read from proud skill groups 12431, 12432 and 12439; the flask's fill, the skill's cooldown, the burst's cooldown and its energy cost are read from the same groups.

## Decisions

- **Savvy Strategy's cooldown starts when she presses it, and gcsim's starts when the flask drains.** gcsim sets the cooldown at the drain plus the windup's 30 frames, which can be up to 334 frames after the press; the framework starts a skill's cooldown at its press. The 15 seconds from the table are shipped from the press, as the framework gives it. Settled by the roadmap's question on the cooldown.
- **Jahoda's poise is zero on every hit.** gcsim gives her strikes, charged shot, flask hits and plunges no poise, and no other source does, so none is dealt until one does. Settled by the roadmap's question on poise.
- **Her plunges take the shared reach at Bennett's timings.** gcsim has no plunge file for Jahoda, so the collision, low and high plunges borrow the shared reach and land at once, as the framework gives a kit without one. Settled by the roadmap's question on the plunges.
- **The flask's absorb reads the first element in the framework's order, not in gcsim's.** gcsim checks the element the flask has already absorbed before the others; the framework's absorb check reads its own fixed order. The two agree while an enemy holds one element's aura; they differ only when an enemy holds two.
- **Constellation 6 is read at each full drain, to every Moonsign member.** gcsim applies its buffs when the flask drains full at Ascendant Gleam, to each character with a Moonsign, Jahoda included, for 20 seconds at 5% Crit Rate and 40% Crit DMG, each restarted by the drain that gives it. The drain reads the team as the press lands, so the buff follows the team it was drained for.
- **The second press's drain is a summon, not a hit of the press.** Whether the drain is a filled or an unfilled hit depends on the gauge when the press lands, which an action's own hit list cannot choose between. The summon is cast where she stands and lands 2 frames after the press when the gauge is full, or 4 frames after it when not, gcsim's frames.
- **Hidden Aces' heals run on a whole-world schedule, not a field's.** gcsim queues each heal tick on her clock, so the heals fall wherever the body stands: nine ticks from frame 12, every 87 frames, stopping at the burst's 790. `schedulePeriodicKitTask` runs them as a whole-world field with a tick interval, cut at its end. Each heal is priced by Jahoda as she stood at the cast, a flat amount and a share of her ATK from proud skill group 12439, and the lowest member gets the second heal too while she has over 70% of her health. Ascension 1's heal multiplier is not built, and neither is Ascension 4's Elemental Mastery buff.

- **Her robots check on the periodic task and strike once they absorb.** gcsim's two robots check their circle for an aura every 46 frames, from frame 6 and 41 frames apart, until one absorbs an element, then strike the three nearest enemies from 41 frames after it, every 140 frames, until the burst's 790. `startJahodaRobots` runs each robot's checks as a whole-world periodic task that a flag stops after the absorb, and a strike as one more task from the absorb's own seconds. They are cast only at Ascendant Gleam, as gcsim reads the Moonsign level at her cast. Ascension 1's extra Electro robot and Constellation 4's energy are not built.
- **Her Moonsign Benediction carries no lunar reaction types.** Rooftop Dash raises the party's Moonsign by one level and names no lunar reaction, so her record holds none. gcsim gives her only the Moonsign flag, and the wiki's page names the same team bonus without any lunar reactions to turn the team's reactions into.

## Not yet built

- **Her Meowball, and the internal cooldown her robots' strikes carry.** Her record holds no Meowball hits yet, so it waits on them. The robots' strikes carry no internal cooldown: gcsim gives them a special group of 15 seconds and four hits, and the engine has no tag for that group.
- **Ascension 1 and 4, and Constellations 1, 2 and 4.** Ascension 1 scales the burst's damage and heal by the party's elements, Ascension 4 adds Elemental Mastery while she heals above 70% HP, Constellation 1 bounces Meowball, Constellation 2 reads the party's elements and the robots' absorbs, and Constellation 4 gives energy on each robot's absorb. They wait on the robots and Meowball, which wait on her record.

## Key files

| File                                                                         | Role                                                                                                                                                    |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/jahodaKit.ts`            | `createJahodaKitBehaviour`, Jahoda's kit with her strikes, charged shot, plunges, Savvy Strategy's pursuit and flask drains, and Hidden Aces' first hit |
| `packages/genshin-world/src/services/kit/effects/schedulePeriodicKitTask.ts` | The whole-world schedule Hidden Aces' heals run on, its tick count cut at its end                                                                       |
| `packages/genshin-world/src/services/kit/characters/jahodaRobots.ts`         | Hidden Aces' two robots: each checks its circle for an aura until it absorbs one, then strikes the three nearest enemies with it                        |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/jahoda), MIT: her normal attacks' hitmarks and cancel windows, the charged shot's frames, Hidden Aces' frames, Savvy Strategy's windup, pursuit, fill, drains and cooldown, and the robots and heals the page lists as not yet built.
