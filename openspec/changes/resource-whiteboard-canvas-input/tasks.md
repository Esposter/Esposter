# Tasks

## 1. Dropped images

- [ ] 1.1 Accept an image file dropped on the canvas, and place it centred on the drop point through the insert the paste uses. Verify: the tests named 'A dropped image is stored as a file asset and placed at the drop point', 'A dropped file that is not an image places nothing' and 'An image that fails to upload alerts and places nothing' written first in EditorCanvas.test.ts and useInsertWhiteboardImages.test.ts, and seen failing.

## 2. Alt text

- [ ] 2.1 Hold alt text on an image, set it from the properties panel, and name the image on the canvas and in the SVG export. Verify: the tests named 'Setting alt text from the properties panel names the image', 'A new image starts with no alt text' and 'Clearing alt text removes the name from the export' written first in ElementImage.test.ts and toPositionedSvg.test.ts, and seen failing.
- [ ] 2.2 Rewrite each stored image to hold empty alt text, on dev then prod. It is a throwaway scratchpad script (the backfills skill), guarded by counting each whiteboard's images and their alt text before and after, and run until it reports no image without the field. Verify: the run's output, not a test.

## 3. The Q key

- [ ] 3.1 Bind Q to toggling the tool lock, and leave the key alone while a field has focus. Verify: the tests named 'Q locks the tool in hand', 'Q with the lock on releases it' and 'Q typed into a text edit is not a lock' written first in useWhiteboardKeyboard.test.ts, and seen failing.

## 4. The record

- [ ] 4.1 Update the whiteboard design's Features, Decisions, Not built and Key files to the built shape. Verify: `pnpm exec openspec validate resource-whiteboard-canvas-input --strict --no-interactive` passes.
