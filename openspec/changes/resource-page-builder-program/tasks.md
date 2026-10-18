## 1. Phase one: model and output

- [ ] 1.1 Build the document model and undo as patches, as the document-model and undo-as-patches changes specify. Verify: a test named after the scenario 'Undo reverts the last edit and redo restores it'.
- [ ] 1.2 Render each type's output on the server, and compile each email there. Verify: a test named after the scenario 'A published page is produced on the server'.

## 2. Phase two: webpage editor

- [ ] 2.1 Build the canvas, the style panel and their keyboard paths, as the canvas and style-panel changes specify. Verify: a test named after the scenario 'A block can be moved with the keyboard alone'.
- [ ] 2.2 Confirm in the browser suite that the editor loads no third-party origin. Verify: a test named after the scenario 'Opening an editor requests no third-party origin'.
- [ ] 2.3 Decide whether the Video and Map types ship with their providers' origins named in the content policy, or ship as uploaded video only, once phase two's browser check shows what the policy blocks. The options are naming the providers' origins, or uploaded video only; this task decides nothing. Verify: the decision is recorded in this change before the Video and Map types are built.

## 3. Phase three: email editor

- [ ] 3.1 Build the email canvas, preview, merge fields and personalised export, as the email change specifies. Verify: a test named after the scenario 'Preview shows the compiled email at mobile width' in the email change.

## 4. Phase four: the swap

- [ ] 4.1 Measure the editor script sizes on the cutover's production build against the 200 KiB ceiling before the cutover merges. Verify: a test named after the scenario 'An editor's script loads within the budget'.
- [ ] 4.2 Ship the cutover, which deletes the old data and the old editor. Verify: a test named after the scenario 'Existing webpages and emails are gone after the cutover'.
