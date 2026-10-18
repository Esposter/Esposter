# Nilou

Nilou's kit is its record and one behaviour module, `createNilouKitBehaviour`, on avatar 10000070: three strikes, a charged attack of two hits, a collision and two plunges, Dance of Haftkarsvar with its Pirouette and Lunar Prayer, and Dance of Abzendegi's hit. Her multipliers are read from proud skill groups 7031, 7032 and 7039, and her skill and burst strike for shares of her Max HP, not her ATK, as gcsim's flat damage does. The skill's cooldown is 18 seconds, the burst's cooldown 18 seconds and its cost 70 energy, the charged attack's stamina 20.

## Decisions

- **Nilou's skill and burst are priced at a share of her Max HP.** gcsim sets its flat damage to a multiplier times her Max HP, so each hit has no talent multiplier of its own and takes the share as its `additiveBaseDamageBonus`, read from its striker as it is priced, as Ayato's Shunsuiken hits take a share of his.
- **Pirouette is a stance of the sword dance, and its third step sets Lunar Prayer on the team.** Dance of Haftkarsvar's cast leaves a stance for ten seconds in which her normal attacks are the three sword dance steps. The third step's `onStart` adds a field that ends the stance 30 frames on, handing the team an eight-second Lunar Prayer stance of the same sword dance, as gcsim's Pirouette does once its third step has landed. A second cast restarts the Pirouette, as a stance of the same character does.
- **The sword dance's Luminous Illusion is the hit Constellation 1 finds.** The illusion's hit is one object shared by both stances, and `getStrikeDamageBonus` adds 65% to that hit alone, so no other strike of the kit takes it.
- **Constellation 6 is her passive bonuses.** Each 1,000 of Max HP gives 0.6% CRIT Rate and 1.2% CRIT DMG, capped at 30% and 60%, as `getPassiveBonuses` reads the combatant's Max HP as it is priced.
- **Leaving the field ends Pirouette and Lunar Prayer, and cancels a pending field.** Both stances end on a swap, and her kit's swap ends the field that would have handed the team Lunar Prayer, as gcsim's exit from the field deletes both statuses.
- **Provisional: the plunges are borrowed.** gcsim has no plunge file for Nilou, so her plunges follow [how a kit is read](../README.md#how-a-kit-is-read) in reach and landing, with Zhongli's poise for the low and high plunge and the collision. The roadmap asks whether a recording of her plunge agrees.

## Not built

- **Ascension 1, Golden Chalice's Bounty, and Ascension 4's Bountiful Core DMG are not built.** Ascension 1 gives every party member a status when the third step of Pirouette lands on a team of only Dendro and Hydro members, which raises the Elemental Mastery of the members hit by Dendro and makes Bloom create Bountiful Cores. A kit has no hook for a status on the other members' hits or on a reaction they trigger, so the team status and the cores wait on one. Ascension 4 scales the cores' DMG by her Max HP, and waits on the same hook.
- **Constellation 2 is not built**, as its RES cut is read off Ascension 1's status, which is not built. Constellation 4, the energy of the third sword dance and the 50% burst DMG bonus for eight seconds, waits on two hooks: `getStrikeDamageBonus` cannot read a timed bonus, since it sees the strike and the enemy and none of the team's effects, and `onStrike` does not say whether a hit is the first of its action, so the energy would be given on every enemy the hit strikes.
- **Lingering Aeon is not built.** Dance of Abzendegi's second hit, at 121 frames, lands on the enemy the first hit struck. `onStrike` gives the body and the team but not the enemy, so no hook can aim the later hit at it.
- **Tranquility Aura and the Pirouette's later steps are not built.** The Whirling Steps' second and third presses, and the Tranquility Aura that the third press sets off, need one step count shared by the dance and the steps, which gcsim keeps. A stance holds neither that count nor a skill chain, as `Kit.elementalSkillChain` belongs to the kit, so the stance's skill plays the first Whirling Steps alone.
- **A press of the skill inside Pirouette is blocked by the cooldown the cast set.** gcsim lets the Whirling Steps be pressed through the cooldown, while a stance's skill press is not exempted from one, so the steps are reachable only once Pirouette has run out. This waits on a hook that lets a stance's skill press ignore the cooldown.

## Key files

| File                                                             | Role                                                                                                                        |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/nilouKit.ts` | `createNilouKitBehaviour`, Nilou's kit with Dance of Haftkarsvar's Pirouette and Lunar Prayer, and Dance of Abzendegi's hit |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nilou), MIT: the strikes' hitmarks, cancel frames and areas, the charged attack's two slashes, the sword dance's and the Whirling Steps' hits and reaches, Dance of Haftkarsvar's share and frames, Pirouette's ten seconds, Lunar Prayer's eight, its 30-frame delay, Dance of Abzendegi's hit and frames, and the constellations' values.
- The proud skill groups 7031, 7032 and 7039 in the hosted game data: each multiplier's index and the cooldowns, the stamina and the energy cost, read at talent level 1.
