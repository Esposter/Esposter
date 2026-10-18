# Gorou

Gorou's kit is its record and one behaviour module, `createGorouKitBehaviour`, avatar 10000055: four strikes, a fully charged shot, a collision and two plunges, Inuzaka All-Round Defense with its General's War Banner, and Juuga with its field that follows the body and its Crystal Collapse. His multipliers are read from proud skill groups 5531, 5532 and 5539; the skill's cooldown and the banner's seconds, and the burst's seconds, cooldown and energy cost, are read from the same groups. The banner's flat DEF and Crunch's 15% Geo DMG Bonus reach the active character on each tick for two seconds, Crunch from a team of three Geo characters, and Juuga's ticks do the same from its field. From Ascension 1 Juuga adds 25% DEF to the party for twelve seconds, and from Ascension 4 the skill and burst add a share of his DEF to their base damage. Constellations are not built: Constellation 1 reads an enemy's Geo damage no kit event carries, Constellation 2 a crystal shard, Constellation 4 a heal a field tick cannot give, and Constellation 6 a CRIT DMG only for Geo, which no attack modifier holds.

## Decisions

- **Juuga's field follows the body, so its centre is the body's ground point on each step.** The field moves with the active character, as gcsim's field does, and its radius is unbounded, so its buffs reach the character on the field wherever it goes. A following field takes the same step as a following summon, and no other field moves.
- **Crystal Collapse is one following summon with its six ticks set out at the cast.** A field's tick has no body to strike from, and a summon that follows the body holds every tick, which ends where the field does, 9 seconds from the hit, as gcsim's collapse stops there.

## Key files

| File                                                             | Role                                                                                                                          |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/gorouKit.ts` | `createGorouKitBehaviour`, Gorou's kit with the General's War Banner, Juuga's following field and its Crystal Collapse summon |
