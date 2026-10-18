## 1. Traveler's element

- [ ] 1.1 Give the Traveler's skill and burst the element of the resonated statue. Verify: tests named after the scenarios 'the Traveler's skill deals the element of the resonated statue' and 'the Traveler deals no element before any statue is resonated with', seen failing first.

## 2. Characters' kits

- [ ] 2.1 Write each playable character without a kit as its own module, from the character kits index. Verify: tests named after the scenarios 'a character with its own kit fights by it' and 'a character without a kit of its own fights by the Traveler's kit', seen failing first.
- [x] 2.2 Build Nefer's kit from her game records and the wiki, frames and areas provisional until a recording measures them. Verify: a test named after the scenario 'Nefer's elemental skill uses her own hits', seen failing first.

## 3. Passives

- [ ] 3.1 Add each passive to its character's module, taking effect at the phase its talent table names. Verify: tests named after the scenarios 'a passive takes effect at its ascension phase' and 'a passive does not take effect below its ascension phase', seen failing first.

## 4. Heals and swaps

- [ ] 4.1 Heal under half HP for Hu Tao's Spirit Soother, with her Constellations 4 and 6 and Blood Blossom, once a kit's actions can read party HP. Verify: tests named after the scenarios 'Spirit Soother heals a character under half HP' and 'Spirit Soother does not heal a character at or above half HP', seen failing first.
- [x] 4.2 End Klee's, Xiao's, Ningguang's and Razor's field effects when their character is swapped off the field. Verify: tests named after the scenarios 'Klee's Sparks 'n' Splash ends when Klee is swapped off the field' and 'a field effect continues while its character stays on the field', seen failing first.
- [ ] 4.3 Move Xingqiu's Raincutter onto the kit events once gcsim gives each character's attack its delay (design.md). Verify: a requirement and scenarios for it are added to the spec, with a test named after each, seen failing first, when the delay is read.

## 5. Rolls

- [x] 5.1 Roll Explosive Spark and Breakthrough Barb as each hit strikes, from the world's random source. Verify: tests named after the scenarios 'Klee's Explosive Spark is applied at a 50% chance on a hit' and 'Yelan's Breakthrough Barb is rolled on each Lingering Lifeline hit', seen failing first.

## 6. Size ceiling

- [ ] 6.1 Bring the world's entry back under its size ceiling. Verify: a test named after the scenario 'a world build over its size ceiling is refused', seen failing first, then the build's size check reports the entry under its ceiling.

## 7. Decisions

- [x] 7.1 Decide Amber's Fiery Rain arrow area: options are radius 2 as the record reads it now, radius 4 as her kit page prices it, or 5.2 as widened by 30%; decides nothing here. Verify: the chosen radius is written into the design before the record is republished.
- [ ] 7.2 Decide whether each periodic discharge record holds every spawn's list or a shared helper builds the lists again, across the seven kits that build them inline; options are the two named, decides nothing here. Verify: the choice is written into the design before any module changes.
- [ ] 7.3 Decide the value model for Go's float division in the kit reader: options are a float flag carried through parsed literals, conversions and the value type, or leaving the constant evaluator as it is; decides nothing here. Verify: the choice is written into the design before the reader changes.
