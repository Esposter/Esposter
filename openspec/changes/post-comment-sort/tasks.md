## 1. Shared sort options

- [ ] 1.1 Add Old to the shared comment sort type and its sort mapping, and give Old its mark in the icon map. Verify: a test named after the scenario 'Comment sort lists Hot, Top, New and Old', written first and seen failing.
- [ ] 1.2 Keep the feed's Sort by control at Hot, New and Top. Verify: a test named after the scenario 'Feed Sort by omits Old', written first and seen failing.

## 2. Comment ordering

- [ ] 2.1 Read each reply branch with the chosen sort, Hot keeping today's order. Verify: tests named after the scenarios 'Hot keeps the ranked reply order', 'Top lists the most-liked reply first', 'New lists the newest reply first' and 'Old lists the oldest reply first', each written first and seen failing.
- [ ] 2.2 Hold one sort for the whole thread, and on a change clear every loaded branch so each re-reads from page one. Verify: a test named after the scenario 'Changing the comment sort re-reads every open branch from page one', written first and seen failing.
- [ ] 2.3 Keep expanded replies expanded when the sort changes. Verify: a test named after the scenario 'Expanded replies stay expanded after a sort change', written first and seen failing.

## 3. Visit lifecycle

- [ ] 3.1 Start the comment sort at Hot on each post and do not persist it. Verify: a test named after the scenario 'Comment sort resets to Hot on the next post', written first and seen failing.

## 4. Old paging

- [ ] 4.1 Confirm the existing cursor pages the Old pair in ascending order with no repeats or gaps; the design expects no cursor change. Verify: a test named after the scenario 'Paging Old reaches every reply once', written first; if it fails against the current cursor, the cursor needs a change before 4.1 is done.
