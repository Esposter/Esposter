# Kujou Sara

Kujou Sara's kit is its record and one behaviour module, `createKujouSaraKitBehaviour`, on avatar 10000056: five strikes, a fully charged shot, a collision and two plunges, Tengu Stormcall's Cover with the crowfeather a fully charged shot drops under it and its Ambush, Constellation 2's weaker crowfeather, and Subjugation: Koukou Sendou's Titanbreaker with its Stormclusters, four bouts of six ticks or six from Constellation 4. Her multipliers are read from proud skill groups 5631, 5632 and 5639; the skill's cooldown and the Ambush's seconds, and the burst's cooldown and energy cost, are read from the same groups. Her Electro hits give the character on the field an ATK Bonus of the table's share of her base ATK, for six seconds. The covered shot is built from Ascension 1, but its shorter charge is not, as a charged attack has one duration. Ascension 4's energy and Constellations 1 and 6 are not built, as no hit reaches the party's energy or the Electro CRIT DMG they need.

## Decisions

- **Tengu Stormcall's ATK Bonus is read on the hit, to the character on the field.** A hit's context holds the party but not the field's combatant, so the bonus takes the active member's id from the party and prices its amount from Sara's own base ATK. gcsim applies it whenever the active character stands in the attack, so a strike on no enemy is where this differs.
- **The Cover is a status, and its crowfeather is the Ambush at the target.** The Cover lasts eighteen seconds, and a fully charged shot under it from Ascension 1 spends it and sets out the Ambush at 150 frames, priced round the target as the strikes' targeted reach. A plunge or an arrow carries no poise, as gcsim gives none, and the plunges' seconds are Ganyu's. Provisional: the Mac measures both.

## Key files

| File                                                                 | Role                                                                                                                               |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kujouSaraKit.ts` | `createKujouSaraKitBehaviour`, Kujou Sara's kit with the Cover and its Ambush, Constellation 2's crowfeather and the Stormclusters |
