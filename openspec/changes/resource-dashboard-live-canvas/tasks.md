## 1. Tiles

- [ ] 1.1 Render each editor tile with the renderer the published page mounts, over the visual's live read. Verify: a test named after the scenario 'A bar chart bound to responses shows its bars in the editor'.
- [ ] 1.2 Pass each tile its whole visual, and share one read among visuals bound to the same source. Verify: a test named after the scenario 'Six charts over one sheet read the sheet once'.

## 2. Pointer input

- [ ] 2.1 Make the chart body take no pointer input in the editor, so the tile owns a drag and a click. Verify: tests named after the scenarios 'A drag across a chart moves its tile' and 'A click on a chart opens its edit form'.
- [ ] 2.2 Keep the corner buttons and the error state's Retry reachable above that layer. Verify: a test named after the scenario 'The corner buttons work over a chart'.

## 3. Redraw and errors

- [ ] 3.1 Redraw a tile on save and at its new height on resize. Verify: tests named after the scenarios 'Changing a chart's type redraws it on save' and 'Resizing a tile redraws its chart to fill it'.
- [ ] 3.2 Show the read's error state with a Retry action. Verify: a test named after the scenario 'An editor tile offers a retry when its read fails'.

## 4. Retire the icons

- [ ] 4.1 Delete the tile preview component and the demo icon map once nothing else imports them. Verify: a search of the app for both names returns no match.
