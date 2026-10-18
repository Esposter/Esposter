# Qiqi

Qiqi's kit is its record and one behaviour module, `createQiqiKitBehaviour`, on avatar 10000035: five strikes, a charged attack of two slashes, a collision and two plunges, Herald of Frost with its initial damage and swipes that follow her, and Fortune-Preserving Talisman's damage and the Talisman it marks enemies with. Her multipliers are read from proud skill groups 3531, 3532 and 3539, and match the wiki's Ancient Sword Art, Herald of Frost and Adeptus Art: Preserver of Fortune values to two decimal places; the charged attack's stamina, the skill's duration and cooldown, and the burst's heal, seconds, cooldown and cost are read from the same groups. The Herald is a summon that follows the body on the field, its regeneration on hit is the shared party heal on each Normal and Charged Attack hit while it stands, and its continuous regeneration is a field with no edge that heals the active character each 4.5 seconds, as the [shared effects](../README.md). The Talisman is a status on each enemy the burst strikes, given before its damage, and damage the character on the field deals an enemy holding it heals that character, at most once a second for each enemy. A Glimpse into Arcanum from Ascension 4, and Ascetics of Frost's energy, Frozen to the Bone's DMG Bonus, Divine Suppression's ATK cut and Rite of Resurrection's revive from one, two, four and six constellations are built. Life-Prolonging Methods is not built.

## Decisions

- **Fortune-Preserving Talisman's damage is group 3539's third parameter**, 284.8%, its heal's ATK share and flat HP its first two and its seconds its fourth, as gcsim's burst damage, burst heal share and burst flat heal and the wiki give them.
- **The Talisman goes on with the burst's damage.** gcsim applies it 40 frames in by a hit of no damage; here the burst's own hit gives it before its damage, so that hit heals, as the wiki notes. The heal answers the character on the field's own hits alone, at most once a second for each enemy, as the wiki's notes give it, and reads Qiqi's ATK as she stands, unbuffed.
- **A Glimpse into Arcanum keeps a longer Talisman.** A Talisman with 6 seconds or more left is not replaced and spends no cooldown, as gcsim's check does.
- **Frozen to the Bone reads Cryo or a Freeze on the enemy**, as gcsim's aura check does.
- **Life-Prolonging Methods is Ascension 1's passive.** A reaction the character on the field triggers gives her 20% Healing Bonus for 8 seconds, unless Herald of Frost stands, as gcsim's qiqi/asc.go gives it; the bonus goes on the character on the field, as the heal it answers reads its own.
- **Herald of Frost's initial damage shares the swipes' internal cooldown.** The wiki tags it Elemental Skill New, which has no `InternalCooldownTag` member here.
- **Rite of Resurrection revives on the step after the burst starts**, through a task, and its 15-minute interval is a status a drown or a jump clears with the rest of the team's effects.

## Key files

| File                                                            | Role                                                                                                                                |
| :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/qiqiKit.ts` | `createQiqiKitBehaviour`, Qiqi's kit with Herald of Frost, the Talisman and its heal, A Glimpse into Arcanum and her constellations |

## Sources

- [Adeptus Art: Preserver of Fortune](https://genshin-impact.fandom.com/wiki/Adeptus_Art:_Preserver_of_Fortune), [Ascetics of Frost](https://genshin-impact.fandom.com/wiki/Ascetics_of_Frost), [Frozen to the Bone](https://genshin-impact.fandom.com/wiki/Frozen_to_the_Bone), [Divine Suppression](https://genshin-impact.fandom.com/wiki/Divine_Suppression) and [Rite of Resurrection](https://genshin-impact.fandom.com/wiki/Rite_of_Resurrection), Genshin Impact Wiki: the Talisman's heal and its notes, and Qiqi's constellations.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/qiqi), MIT: the Talisman's seconds and heal interval, A Glimpse into Arcanum's roll, interval and longer-Talisman check, and Frozen to the Bone's aura check.
