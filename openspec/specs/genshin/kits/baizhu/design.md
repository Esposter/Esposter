# Baizhu

Baizhu's kit is its record and one behaviour module, `createBaizhuKitBehaviour`, on avatar 10000082: four strikes, a charged attack, a collision and two plunges, Universal Diagnosis's first hit, and Holistic Revivification's seamless shield, Constellations 1 and 4, and Constellation 2's Gossamer Sprite: Splice without its heal. His multipliers are read from proud skill groups 8231, 8232 and 8239; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. The shield absorbs his share of Max HP plus its flat amount. It lasts to the frame gcsim gives its first expiry, and five recasts, every 146 frames from 223 frames, each explode the shield they replace as Spiritvein, which strikes the enemies within the skill's reach at its ATK multiple. His plunges take Bennett's timings and poise, as his gcsim folder has no plunge file; these are provisional. From Ascension 1, Five Fortunes Forever raises each of his Dendro hits by 25% DMG while the character on the field is at half their HP or more, read off the party as the strike lands.

Not built yet: Universal Diagnosis's bounces to the next nearby enemy and its heal at the chain's end, which need a hit that picks each bounce's target; the Seamless Shield's heals on each recast and on its removal, which the recast field's tick and the shield's `EffectExpired` can give the active character through `changeKitMemberHealth`; Constellation 2's heal, 20% of the Gossamer Sprite's normal healing, which the record holds no value for; Constellation 6, which needs the Sprite's and the Splice's hits to make a Seamless Shield; Ascension 1's 20% Healing Bonus while the character on the field is below half HP, which no heal of his reads yet and no passive hook reads the field's HP for; and his Ascension 4 passive, which rides the Seamless Shield's heals.

## Decisions

- **Baizhu's plunges take Bennett's timings and poise.** His gcsim folder has no plunge file, so his collision, low and high plunge land at Bennett's frames (30, 36 and 38 frames for the collision and the hits, 100 and 150 poise) with his own multipliers, as `baizhuKit.ts` writes them; his animation showing otherwise would move them.

- **Constellation 2's Splice is queued on the enemy its active member struck.** gcsim's `c2` (`baizhu/cons.go:25`) subscribes to each enemy's damage and queues the Splice when the active character dealt it, once every five seconds through a status on Baizhu, as the kit's `onKitEvent` does on each `DamageTaken` event whose striker is the active member. The Splice is a Dendro hit of 2.5 talent multiplier, dealt as Elemental Skill DMG, from the dump's Constellation 2 row (paramList 2.5 and 5.0), with a circle of 0.6 metres about its target, as gcsim's `NewCircleHitOnTarget` gives it. A strike with a target lands on that target only, so the Splice does not reach the enemies within 0.6 metres of it, a gap the Aino Constellation 2 design records too. Its heal is not built: the Sprite's normal healing is not in the record. gcsim reuses the skill's first hitmark for the Splice, a TODO in its source, which a passive's hit does not price.

## Key files

| File                                                              | Role                                                                                                                                                         |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/baizhuKit.ts` | `createBaizhuKitBehaviour`, Baizhu's kit with his strikes, charged attack and plunges, Universal Diagnosis's first hit, and Holistic Revivification's shield |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/baizhu), MIT: Baizhu's strikes' hitmarks, cancel frames and boxes, the charged attack, Universal Diagnosis' first hit and animation, and Holistic Revivification's animation, shield timings and recasts.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Baizhu's own folder has none.
