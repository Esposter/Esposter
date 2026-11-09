# Tasks

## 1. The sketch level

- [ ] 1.1 Add the optional sketch level to the shape, sticky note and arrow models, and the optional corner setting to the shape model, each described in the shared element schema. Verify: tests named after the scenarios 'A sketch level that is not one of the three is refused' and 'A corner setting that is not sharp or round is refused' written first and seen failing.
- [ ] 1.2 Scale each sketched element's offset by its sketch level on the canvas and in the export, with the artist level drawing the offset outlines draw today. Verify: tests named after the scenarios 'Architect draws a shape with straight edges', 'Cartoonist draws a larger offset than artist' and 'An arrow route is drawn straight at the architect level' written first and seen failing.
- [ ] 1.3 Keep the outline sketched by its element at every render with the scaled offset. Verify: the test named after the scenario 'A shape draws the same hand-drawn outline on every render' stays green after the offset is scaled.

## 2. Corners

- [ ] 2.1 Round a shape's sketched corners on the canvas and in the export, with a radius that grows with the shape's size up to a limit. Verify: tests named after the scenarios 'Round corners curve the outline' and 'A round corner stops growing at the limit' written first and seen failing.
- [ ] 2.2 Offer the corner setting for every shape with corners, and no corner setting for an ellipse. Verify: a test named after the scenario 'An ellipse offers no corner setting' written first and seen failing.

## 3. Smoothing

- [ ] 3.1 Draw each freehand stroke as a smooth curve through its stored points on the canvas and in the export, leaving the stored points as they are. Verify: tests named after the scenarios 'A freehand stroke draws smoothed' and 'A stroke saved before the change draws smoothed' written first and seen failing.

## 4. The properties panel

- [ ] 4.1 Add the sketch level control to the panel of one selected shape, sticky note or arrow, and the corner control to the panel of one selected shape, each committed through the property command. Verify: a test named after the scenario 'Architect draws a shape with straight edges' drives the control and is written first and seen failing.

## 5. The record

- [ ] 5.1 Update the whiteboard design's Features, Decisions and Not built for the sketch levels, the corners and the smoothing, so its Not built list no longer says strokes are not smoothed. Verify: `pnpm exec openspec validate resource-whiteboard-shape-look --strict --no-interactive` passes.
