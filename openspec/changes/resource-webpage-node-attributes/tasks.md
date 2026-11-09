# Tasks

## 1. The button's target

- [ ] 1.1 Add the new-tab choice to the button and render its target, with the safe relationship a new-tab link always carries. Verify: tests named after the scenarios 'A same-tab button publishes no new-tab attribute', 'A new-tab button publishes with a safe relationship' and 'A new-tab button keeps its own relationship and adds noopener' written first and seen failing.
- [ ] 1.2 Refuse a target outside the two choices on save. Verify: a test named after the scenario 'A target outside the two choices is refused on save' written first and seen failing.

## 2. The element id and title

- [ ] 2.1 Add an element id and a title to every webpage node and write them onto the node's published element, leaving out an empty id. Verify: tests named after the scenarios 'An element id links to its element from a button', 'A title shows as the tooltip of its element' and 'An empty element id publishes no id' written first and seen failing.
- [ ] 2.2 Refuse on save an element id that holds a space, and two nodes that share one element id. Verify: tests named after the scenarios 'An element id with a space is refused on save' and 'Two nodes with one element id are refused on save' written first and seen failing.

## 3. The Content panel

- [ ] 3.1 Edit the button's new-tab choice in the Content panel. Verify: a test named after the scenario 'The Content panel sets a button to open in a new tab' written first and seen failing.
- [ ] 3.2 Edit a node's element id and title in the Content panel. Verify: a test named after the scenario 'The Content panel sets an element id and title' written first and seen failing.

## 4. The record

- [ ] 4.1 Update the document model design's webpage node types and the canvas design's Content panel paragraph to name the new fields as built. Verify: `pnpm exec openspec validate resource-webpage-node-attributes --strict --no-interactive` passes.
