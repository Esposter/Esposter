## 1. Night spots

- [ ] 1.1 Give residents with a night spot that spot from seven in the evening to six in the morning, and their day spot otherwise, with a resident that has only a day spot keeping it. Verify: `joinResidents.test.ts` asserts that a resident with a night spot gains one and that a resident with only a day spot keeps it through the night, written first and seen failing. Blocked on the PC's NPC placements export, which fills the night-spot map; the wiki gives locations by name only.
- [x] 1.2 Move residents at the turn of the hour only while out of view. Verify: a test whose scenario is 'A resident in view is not seen to jump at the hour', written first and seen failing.
- [x] 1.3 Read each resident's spot from the world clock every frame. Verify: a test named after the scenario 'Setting the time moves residents'.
- [x] 1.4 Keep residents absent at night only where the game's record marks them. Verify: tests named after the scenarios 'A resident marked absent at night is not drawn after dark' and 'A resident not marked absent stays in the world at night'.

## 2. Nod-Krai

- [ ] 2.1 Read Nod-Krai's residents and their night spots from the wiki's NPC pages with `pnpm -C scripts genshin:assets residents`, which rewrites the regions' data. Verify: a test named after the scenario 'A Nod-Krai resident keeps the wiki's hours'.

## 3. Vendors

- [x] 3.1 Let each vendor sell only while standing at their spot in their hours, once the shops sell. Verify: a test named after the scenario 'A vendor is closed outside their hours'.
