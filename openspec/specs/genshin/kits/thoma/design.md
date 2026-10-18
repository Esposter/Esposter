# Thoma

Thoma's kit is its record and one behaviour module, `createThomaKitBehaviour`, on avatar 10000050: four strikes, a charged attack, a collision and two plunges, Blazing Blessing's hit with its shield and Pyro infusion, and Crimson Ooyoroi's initial hit with its Fiery Collapses. His multipliers are read from proud skill groups 5031, 5032 and 5039; Blazing Blessing's shield seconds, most shield and cooldown, Fiery Collapse's shield, its seconds and the seconds between collapses, the burst's seconds, cooldown and energy cost, and the charged attack's stamina are read from the same groups. The shield is set from his Max HP and the table's share and flat HP, and his Pyro infusion lasts the 30 frames gcsim gives it.

For the burst's 15 seconds the Ooyoroi stands as a summon, and a normal attack the character on the field starts sets off a Fiery Collapse from its body, at most once a second: a box 4.5 metres wide and 8 long, 1U of Pyro at 11 frames. The first enemy a collapse strikes gives the team Thoma's shield, its share of his Max HP and its flat HP added to his shield already standing, up to the most Blazing Blessing's shield may hold, for 8 seconds. From Ascension 4, Flaming Assault adds 2.2% of Thoma's Max HP to each Fiery Collapse's DMG. His Ascension 1 passive, Imbricated Armor, is not built, as a shield's absorption reads the struck character's attributes without its buffs, so a Shield Strength bonus would reach no shield; his constellations are not built. The plunges' timing, the charged attack's stamina and the burst's energy cost are provisional.

## Decisions

- **Thoma's Fiery Collapse fires on a shielded character's damage, which no kit event reaches yet.** gcsim triggers it on each hit a shielded character takes, behind a one-second internal cooldown, and it sets off a shield of its own. The kit fires it from normal attacks instead, as the bullet below says.
- **Thoma's plunges land 0.4 seconds in.** gcsim gives his plunges no timing, so his reaches and landing are Ganyu's.
- **Fiery Collapse answers the normal attacks of whoever is on the field, as Xingqiu's Raincutter does.** gcsim sets it off through the same watcher as Raincutter, on the normal attacks the character on the field starts, behind its one-second interval, so the Ooyoroi is a summon that coordinates with them. Its shield stacks onto the one Thoma holds, as gcsim's does, capped at Blazing Blessing's most.
- **Flaming Assault takes effect from Ascension 4.** gcsim's asc.go gates it at Ascension 1, but the talent table names Ascension 4, so the table's phase stands.
- **Blazing Blessing's shield is set at its table value without a cap for a recast**, as the kit's shields replace each other, as gcsim's do.

## Key files

| File                                                             | Role                                                                                                                                                                                                      |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/thomaKit.ts` | `createThomaKitBehaviour`, Thoma's kit with Blazing Blessing's hit, shield and Pyro infusion, Crimson Ooyoroi's initial hit with its Fiery Collapses and their shield, his charged attack and his plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/thoma), MIT: the kit's hitmarks, cancel frames and areas, the charged attack's frames, Blazing Blessing's hit, animation and shield, Crimson Ooyoroi's initial hit and animation, and Fiery Collapse's trigger, interval, box, hitmark and gauge, its shield's stacking and cap, and Flaming Assault's share of Max HP.
