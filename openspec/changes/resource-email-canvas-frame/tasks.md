## 1. Reproduce

- [ ] 1.1 Open an email on the canvas in the browser and record each blocked-script message with its stack and its frame. Verify: the stacks are written into this change's design under Notes, before any fix is chosen.
- [ ] 1.2 Record the scroll flicker's sequence in the browser: which element's size changes, and in what order, as an edit is made. Verify: the sequence is written into this change's design under Notes.

## 2. Fix the blocked script

- [ ] 2.1 Remove the script's source when the app is the source. Verify: a test named after the scenario 'the canvas runs no script in its frame', seen failing first.
- [ ] 2.2 When an extension is the source, record it in the design and leave the canvas unchanged. Verify: the design names the extension.

## 3. Fix the scroll flicker

- [ ] 3.1 Settle the pane's size before the frame sizes against it, or break the loop the recorded sequence names. Verify: a test named after the scenario 'the scroll position holds while an email is edited', seen failing first.

## 4. Visual check

- [ ] 4.1 Confirm in the browser that the scroll position holds across a run of edits, and that the console shows no blocked script. Verify: the owner checks the scroll and console in the browser and notes the result here.
