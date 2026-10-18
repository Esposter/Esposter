## 1. Roster slice

- [x] 1.1 Keep the held characters in the save and read them back with their copy counts. Verify: a test named after the scenario 'A held character survives a reload' in readGenshinSave.test.ts, written first and seen failing.
- [x] 1.2 Start the combat roster at the Traveler alone when the saved roster is empty. Verify: a test named after the scenario 'A new player starts with the Traveler alone'.
- [x] 1.3 Refuse a save past the character limit on read. Verify: a test named after the scenario 'A save past the character limit is refused'.

## 2. Companionship EXP

- [x] 2.1 Keep each character's Companionship EXP under its id, including for a character the roster lacks. Verify: a test named after the scenario 'Companionship EXP is restored on the character it was earned by' in readGenshinSave.test.ts.
- [x] 2.2 Write the saved EXP of a character the roster lacks back unchanged. Verify: a test named after the scenario 'A character missing from the roster keeps its saved Companionship EXP'.

## 3. Merge

- [x] 3.1 Merge a character both saves hold to the copy further on, with the larger copy count. Verify: a test named after the scenario 'The copy further on is kept when both saves hold a character' in mergeGenshinSave.test.ts.
- [x] 3.2 Settle equal levels by constellations. Verify: a test named after the scenario 'Equal levels are settled by constellations'.
- [x] 3.3 Keep a character only the guest holds. Verify: a test named after the scenario 'A character only the guest holds is kept'.

## 4. Session sync

- [ ] 4.1 Hand the session's copy counts from the saved counts and write the roster and copy counts on sync. Verify: a test named after the scenario 'A held character survives a reload' run through the session's sync.
