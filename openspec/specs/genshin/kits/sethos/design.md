# Sethos

Sethos's kit is built from its record alone, on avatar 10000097, and `createSethosKitBehaviour` holds no behaviour of its own: three strikes, the second of two hits, a fully-charged Aimed Shot as his charged attack, a collision and two plunges, and Ancient Rite: Thunderous Roar of Sand. His multipliers are read from proud skill groups 9731, 9732 and 9739, matching gcsim's to three decimal places. His skill's cooldown, his burst's cooldown and cost, and the charged attack's lack of a stamina cost come from those groups or from gcsim. The skill strikes an Electro circle of radius 4.5 round him at 13 frames of a 38-frame animation. The fully-charged Aimed Shot lands at 74 frames of an 83-frame animation, and its Electro gauge is 1U.

## Decisions

- **The fully-charged Aimed Shot is the charged attack.** Sethos has one aimed shot in the kit's slot, so the fully-charged shot takes it, as Ganyu's does, and it is marked aimed so the body turns to the camera's aim while it is held.
- **Hitmarks and animations are gcsim's.** His strikes' frames are 19, 35 and 69, with the second strike's two hits at 12 and 15 frames, as gcsim's attack file gives them, and no poise, since gcsim gives none.
- **His plunges are provisional.** Sethos has no gcsim plunge file; like Chevreuse's, his plunges use the shared reach with no poise and land as their action starts, and the Manual verification list on the roadmap asks about them.

## Not built

- **Shadowpiercing Shot is waiting on a hold of the aimed shot.** Holding the aim to its full length fires a piercing shot that reaches 15 metres with 1.4 ATK and a share of Elemental Mastery, which the kit's charged attack has no second hold level for. It waits on a hook for the aimed shot's hold levels.
- **The plain Aimed Shot is not built.** A short, uncharged shot deals Physical damage at 16 frames, and the kit has no slot for it beside the fully-charged one. It waits on the same hold-level hook as Shadowpiercing Shot.
- **Secret Rite's Dusk Bolts are not built.** For 8 seconds his burst makes his normal attacks Dusk Bolts, Electro with a flat Elemental Mastery bonus and a piercing reach, and forbids aiming. A stance holds normal attacks and a charged attack, and Dusk Bolts have no charged attack to stand in for, so the buff waits on a stance without one. The burst deals no damage itself, so it is built as its animation, cost and cooldown.
- **Ancient Rite's energy refund on a reaction is not built.** A reaction that his own skill's damage triggers refunds 12 energy, and the kit's reaction event does not say which action struck, so it waits on a hook that names the striking action.
- **His ascension passives and constellations are not built.** Ascension 1's shorter charge, which spends energy to skip part of the aim, waits on the same hold-level hook as Shadowpiercing Shot. The fourth ascension's flat bonus to Shadowpiercing Shot waits on it too. The constellations that raise talent levels are the [talents](../../talents/design.md) page's.

## Key files

| File                                                              | Role                                                                                        |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/sethosKit.ts` | `createSethosKitBehaviour`, empty: his strikes, aimed shot and skill are his record's alone |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/sethos), MIT: each strike's hitmarks, frames and boxes, the fully-charged Aimed Shot's hitmark and animation, the skill's circle, hitmark, cooldown and energy refund, and the burst's buff and animation, as the passives and constellations listed as not built.
