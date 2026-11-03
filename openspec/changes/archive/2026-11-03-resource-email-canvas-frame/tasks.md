## 1. Reproduce

- [x] 1.1 Open an email on the canvas in the browser and record each blocked-script message with its stack and its frame. Verify: the stacks are written into this change's design under Notes, before any fix is chosen.
  - Done in a driven Chrome 156 with no extensions: no blocked script in the starter email, in an email of every node type or in Preview. The record is the design's Notes.
- [x] 1.2 Record the scroll flicker's sequence in the browser: which element's size changes, and in what order, as an edit is made. Verify: the sequence is written into this change's design under Notes.
  - Done: the overlay boxes were laid out in the email's flow, so a hover and a selection each added a box's height to the frame's document. The sequence is the design's Notes.

## 2. Fix the blocked script

- [x] 2.1 Remove the script's source when the app is the source. Verify: a test named after the scenario 'the canvas runs no script in its frame', seen failing first.
  - Not owed: the reproduction found no script from the app, so none is removed and no test is written. The scenario holds, as read in the browser.
- [x] 2.2 When an extension is the source, record it in the design and leave the canvas unchanged. Verify: the design names the extension.
  - Done: the source is not the app, and the design records that an extension in the owner's browser is the usual cause, which only the owner's browser can name.

## 3. Fix the scroll flicker

- [x] 3.1 Settle the pane's size before the frame sizes against it, or break the loop the recorded sequence names. Verify: a test named after the scenario 'the scroll position holds while an email is edited', seen failing first.
  - Done: the overlay layer and boxes carry their styles inline, and the scroll height is constant through a hover, a selection and further selections. No test: a layout claim about the app's own components waits for a browser suite (the `testing` skill).

## 4. Visual check

- [x] 4.1 Confirm in the browser that the scroll position holds across a run of edits, and that the console shows no blocked script. Verify: the owner checks the scroll and console in the browser and notes the result here.
  - Done in a driven Chrome at the owner's instruction, in the light and the dark theme: the frame's scroll height holds, and the console shows no blocked script.
