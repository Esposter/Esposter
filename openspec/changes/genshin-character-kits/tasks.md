## 1. Traveler's element

- [x] 1.1 Give the Traveler's skill and burst the element of the resonated statue. Verify: tests named after the scenarios 'the Traveler's skill deals the element of the resonated statue' and 'the Traveler deals no element before any statue is resonated with', seen failing first.

## 2. Characters' kits

- [x] 2.1 Write each playable character without a kit as its own module, from the character kits index. Verify: tests named after the scenarios 'a character with its own kit fights by it' and 'a character without a kit of its own fights by the Traveler's kit', seen failing first.
- [x] 2.2 Build Nefer's kit from her game records and the wiki, frames and areas provisional until a recording measures them. Verify: a test named after the scenario 'Nefer's elemental skill uses her own hits', seen failing first.

## 3. Passives

- [x] 3.1 Add each passive to its character's module, taking effect at the phase its talent table names. Verify: tests named after the scenarios 'a passive takes effect at its ascension phase' and 'a passive does not take effect below its ascension phase', seen failing first.

## 4. Heals and swaps

- [x] 4.1 Heal Hu Tao's Spirit Soother for a larger share at or under half HP, with her Constellations 4 and 6 and Blood Blossom, once a kit's actions can read party HP. Verify: tests named after the scenarios 'the Spirit Soother heals Hu Tao above half HP' and 'the Spirit Soother heals Hu Tao more at or below half HP', seen failing first. The heal is not gated on half HP: the spec's earlier scenario that Hu Tao is not healed at or above half HP contradicted the in-game text and was corrected.
- [x] 4.2 End Klee's, Xiao's, Ningguang's and Razor's field effects when their character is swapped off the field. Verify: tests named after the scenarios 'Klee's Sparks 'n' Splash ends when Klee is swapped off the field' and 'a field effect continues while its character stays on the field', seen failing first.
- [x] 4.3 Move Xingqiu's Raincutter onto the kit events once gcsim gives each character's attack its delay (design.md). Verify: a requirement and scenarios for it are added to the spec, with a test named after each, seen failing first, when the delay is read.

## 5. Rolls

- [x] 5.1 Roll Explosive Spark and Breakthrough Barb as each hit strikes, from the world's random source. Verify: tests named after the scenarios 'Klee's Explosive Spark is applied at a 50% chance on a hit' and 'Yelan's Breakthrough Barb is rolled on each Lingering Lifeline hit', seen failing first.

## 6. Size ceiling

- [ ] 6.1 Cut the world's entry to a lower size ceiling. The gate is the entry's measured size as it stands, 2,284,676 bytes, held by the snapshot in `packages/genshin-world/src/index.test.ts`, so a regression fails that test. Verify: the snapshot holds the cut's size once the cut lands. Blocked: a cut to a lower ceiling is a separate open item, not decided here, so this box stays open for it; measuring a cut needs a build.

## 7. Decisions

- [x] 7.1 Decide Amber's Fiery Rain arrow area: options are radius 2 as the record reads it now, radius 4 as her kit page prices it, or 5.2 as widened by 30%; decides nothing here. Verify: the chosen radius is written into the design before the record is republished.
- [x] 7.2 Decide whether each periodic discharge record holds every spawn's list or a shared helper builds the lists again, across the seven kits that build them inline; options are the two named, decides nothing here. Verify: the choice is written into the design before any module changes.
- [x] 7.3 Decide the value model for Go's float division in the kit reader: options are a float flag carried through parsed literals, conversions and the value type, or leaving the constant evaluator as it is; decides nothing here. Verify: the choice is written into the design before the reader changes.
- [x] 7.4 Decide whether a character task queued with its delay as an argument, `QueueCharTask(fn, delay)`, has that delay read into the kit's timing, which makes the queue callee set one the kit reader and the task reader share; options are reading it or keeping the enemy-only reader as it is, decides nothing here. Verify: the choice is written into the design before the reader changes, and the callee set moves only with it.
- [ ] 7.5 Decide whether a kit's `spec.md` and `design.md` each keep an Open list, as the genshin kit pages do now, or the spec keeps the gap list and the design only the built facts; options are the two named, decides nothing here, and it spans every kit page that carries both. Verify: the choice is written into `openspec/specs/genshin/kits/beidou/` and the design before any kit page's Open list changes.
- [ ] 7.6 Decide which root a spec cites the game-data cache by, `{data-root}/` or `{data-root}/`: the two resolve to one directory, since `{data-root}` is a symlink to it (`openspec/specs/architecture/machine-efficiency/design.md`), but the kit records cite both: Durin's the first, Clorinde's and Citlali's the second, and Ganyu's both. The two forms appear in more than 200 files under `openspec/`, so the choice decides nothing here and the sweep to it is a ledger's, run once the root is chosen. Verify: the choice is written into `openspec/specs/architecture/machine-efficiency/design.md` before any spec's citation changes.

## 8. Beidou's kit against its scenarios

- [ ] 8.1 End the Thunderbeast's Targe when Beidou falls, before its 15 seconds run out, as the scenario "The Targe ends with Beidou's fall" states. The kit has no downed-member event to end it on, so a kit-events change comes first, and the kit's behaviour then reads it. Verify: a test named after the scenario 'The Targe ends with Beidou's fall', seen failing first. Not built: this box stays open until the event exists.
- [ ] 8.2 Cast a discharge only when the strike hits, as the scenario "A strike casts a discharge" states, where `beidouKit.ts` casts one on every hit whose hitmark the Targe still stands at. The hook must be handed whether the strike hit before its discharge is cast. Verify: a test named after the scenario 'A strike casts a discharge' with a miss case, seen failing first. Not built: this box stays open until the hook is handed the hit.
