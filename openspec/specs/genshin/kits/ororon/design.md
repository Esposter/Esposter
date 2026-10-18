# Ororon

Ororon's kit is its record and one behaviour module, `createOroronKitBehaviour`, avatar 10000105: three strikes, a fully charged Aimed Shot, the Spirit Orb's first hit, Dark Voices' Echo with its ritual and soundwave field, and a collision and two plunges. His multipliers are read from proud skill groups 10531, 10532 and 10539, the Spirit Orb's cooldown and the burst's seconds, cooldown and energy cost from the same groups. Ascension 4's energy on the active character's strikes and plunges comes after the Spirit Orb's hit, and Constellation 2's Electro DMG Bonus builds on each enemy the burst's hits strike. Constellation 4 shortens the soundwave's tick.

## Not yet built

- **Hypersense, and so Ascension 1, Constellation 1 and Constellation 6, wait on the Nightsoul hook.** gcsim's Nightsoul state gives Ororon points from the party's Nightsoul bursts and from his own hits, and spends them on Hypersense, which strikes the enemies near a Nightsoul-tagged hit. The framework has no Nightsoul state, so none of it is built, and Constellation 1's extra bounce and its 50% DMG Bonus go with it, since that bonus reads only Hypersense.
- **The Spirit Orb's bounce waits on a chained hit.** gcsim sends the orb on to up to three more enemies, four with Constellation 1, each one nearest the last. A hit's reach is an area round the body, so the orb's first hit reaches every enemy in its targeted area, which can overcount in a crowd, and the bounce's cap is not built.
- **Constellation 4's 8 energy on the burst's hit waits on a timed energy gain.** gcsim restores it 36 frames into the burst whether or not the ritual strikes anything, and a kit's effects land only on a strike or a step's start.
- **The unheld Aimed Shot is not a kit action.** The bow kits built so far model only the fully charged shot, and this kit follows them.

## Decisions

- **The strikes and the Spirit Orb's hit land 10 frames after gcsim's hitmarks.** gcsim queues each arrow and orb to travel 10 frames to its target, so each lands at its hitmark plus the travel, as Aloy's, Collei's and Ganyu's bow kits do. Sigewinne's shot does not, a question on the roadmap.
- **The soundwave field ticks from the cast, not after it.** gcsim's first tick falls 60 frames after the burst starts, and each tick's hit lands on it. Constellation 4 makes the tick 45 frames apart.
- **Constellation 2's stacks are one buff refreshed by each hit.** Its 8% starts with the burst and gains 8% for each enemy the ritual or a soundwave strikes, to 32%, and keeps the burst's nine seconds rather than restarting them on each hit.
- **Ascension 4 counts its three triggers on the Spirit Orb's status.** The status starts at the orb's hit and runs 15 seconds, and each trigger gives 3 energy to the active character and to Ororon, then a second's cooldown before the next, as gcsim's internal cooldown gives it.
- **The plunges are the table's standard ones.** gcsim has no plunge file for him, so the collision, low and high plunge read the proud group's 5, 6 and 7 and land the moment their action starts, with a zero animation, which is what the framework gives a plunge with no source timing. A recording of his plunges landing together would settle the shared reach; a later landing would need frames.
- **Poise is zero where gcsim gives none.** gcsim gives Ororon's strikes, Aimed Shot, Spirit Orb, burst and plunges no poise, so `ororonKit.ts` stands every hit at 0, until a recording of the game's poise on them says otherwise.

## Key files

| File                                                              | Role                                                                                                                                                        |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ororonKit.ts` | `createOroronKitBehaviour`, Ororon's kit with his strikes, Aimed Shot, Spirit Orb, burst and soundwave field, and his Ascension 4 and Constellation 2 and 4 |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ororon), MIT, at v2.47.2: Ororon's strikes' hitmarks and cancels, the Aimed Shot's and the Spirit Orb's frames, Dark Voices' Echo's ritual, soundwave and field, and Ascension 4's and Constellations 2 and 4's values.
