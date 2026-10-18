## 1. Phase one: model and output

- [x] 1.1 Build the headless core, as the headless-core change specifies. Verify: a test named after the scenario 'Reversing a move' in that change.
- [ ] 1.2 Build the registry root and render fold, then the MJML blocks package over it, as those two changes specify. Verify: the MJML blocks change's test named after its scenario 'A valid email compiles under strict validation', which runs over a registry whose root that change declares.
- [ ] 1.3 Build the document model and undo as patches over the headless core, as the document-model spec and the undo-as-patches change specify. Verify: a test named after the scenarios 'Undo restores the document before the last edit' and 'Redo reapplies an undone edit' in the undo-as-patches change.
- [ ] 1.4 Build the webpage renderer and the server's email compile beside the editor that runs today, as the document-model spec specifies. Verify: tests named after the scenarios 'A webpage document renders as one HTML document' and 'A valid email document compiles to email HTML' in the document-model spec.

## 2. Phase two: webpage editor

- [ ] 2.1 Build the canvas, the style panel and their keyboard paths, as the canvas and style-panel changes specify. Verify: a test named after the scenario 'A block can be moved with the keyboard alone'.

## 3. Phase three: email editor

- [ ] 3.1 Build the email canvas, preview, merge fields and personalised export, as the email change specifies. Verify: a test named after the scenario 'Preview shows the compiled email at mobile width' in the email change.

## 4. Phase four: the proof

- [ ] 4.1 Run the benches and the browser proofs over both editors, as the performance-and-proof change specifies. Verify: a test named after the scenario 'The canvas matches the published page within one pixel' in that change.

## 5. Phase five: the swap

- [ ] 5.1 Measure the editor script sizes on the cutover's production build against the 200 KiB ceiling before the cutover merges. Verify: a test named after the scenario 'An editor's script loads within the budget'.
- [ ] 5.2 Ship the cutover, which binds the new editors to the two resource types, bakes each published page on the server, and deletes the old data and the old editor. Verify: a test named after the scenario 'A published page is produced on the server', and a test named after the scenarios 'A published webpage is removed by the cutover' and 'A webpage in the recycle bin is not restored by the cutover' in the cutover change.
