## 1. Event banner schedule

- [x] 1.1 Read each event banner page into its kind, window and featured items. Verify: parseWishPage.test.ts, written first and seen failing, named after 'An event banner page is read into its window and featured items'.
- [x] 1.2 List the wiki's wish pages into the schedule record, joining each name to its id, and fail the build on an item the names do not hold. Verify: a test named after 'A schedule naming an unknown item fails the build'.
- [x] 1.3 Offer event banners only inside their windows, beside the standard ones. Verify: getOpenEventBanners.test.ts, named after 'A banner is offered inside its window' and 'A banner is not offered between windows'.

## 2. Second character banner

- [x] 2.1 Key banners by banner and share the character banners' counters. Verify: a test named after 'Two character banners are offered together and share the character banners' counters'.

## 3. History and roster

- [ ] 3.1 Record every draw's kind, item and time, and list them in the history for the year, pruned at write. Verify: appendWishHistory.test.ts, tests named after 'a draw appears in the history with its kind, item and time' and 'history keeps draws within the year and drops the older'. The History panel and the backfill of stored saves are still owed.
- [x] 3.2 Add a first draw to the roster and count a repeat draw as a copy with its Starglitter returned. Verify: tests named after 'A new character joins the roster' and 'A repeat draw returns Starglitter'.

## 4. Beginners' wish

- [x] 4.1 Draw Noelle as the beginners' featured four-star on the eighth wish only. Verify: a test named after 'Noelle is drawn only on the eighth beginners' wish'.
