# Canvas frame: blocked script and scroll flicker

## Why

Two symptoms show up on the page builder's canvas, and both are reported from the browser rather than found in a test:

- The console logs "Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed and the 'allow-scripts' permission is not set", twice per load of an email. The canvas frame is sandboxed without scripts on purpose, so something is trying to run a script inside it.
- The email's scroll area flickers. Scrollbars appear, disappear and move while an email is edited, which reads as styles that change size as they are laid out.

Neither cause is confirmed. The code read so far rules out some candidates, and the browser is the way to settle the rest.

## What is known from the code

- The canvas frame is `sandbox="allow-same-origin"`, with no `allow-scripts`, and its srcdoc holds no script element.
- The frame package adopts a style sheet into the frame and writes no script.
- Text nodes draw their note html through the sanitiser, which drops inline handlers and scripts from the allowance the editor passes.
- The email canvas's width is the device's width, not a measurement of the pane, so the drawing does not resize itself from its own layout.

These leave the cause open. A script can still reach the frame from outside the app's own code, for example a browser extension that injects into every frame, or a `javascript:` link the frame tries to follow. The scroll flicker is open between the frame's scale and size observers and the pane that holds it.

## What changes

- Reproduce both symptoms in the browser and record the source of each blocked script, from its stack, before any fix is chosen.
- Fix the cause the reproduction names. If the script comes from the app, it is removed at its source. If it comes from an extension, the canvas is not changed to hide it, and the change records that.
- Remove the scroll flicker at its cause, so the pane's size is settled before the frame sizes against it.

## Out of scope

The renderer's drawings ([resource-email-canvas-drawing](../resource-email-canvas-drawing/proposal.md)) and the preview's transport ([resource-email-preview-transport](../resource-email-preview-transport/proposal.md)).
