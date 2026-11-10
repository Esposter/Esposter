## Why

The whiteboard sketches every outline at one fixed offset, so a diagram that needs clean lines cannot drop the sketch. Its corners are always sharp, and a freehand stroke draws as straight segments between the points the pointer sampled, so a quick stroke shows a corner at each point. The reference offers three sketch levels, rounded corners and a smoothed freehand line.

## What Changes

- A shape, a sticky note and an arrow take a sketch level of architect, artist or cartoonist. Architect draws without the sketch, and artist is the sketch the outlines draw today.
- A shape takes sharp or round corners. A round corner's radius grows with the shape's size up to a limit. An ellipse has no corner setting.
- A freehand stroke draws as a smooth curve through the points the pointer passed. A stroke already saved draws smoothed, with its stored points unchanged.
- A stored sketch level or corner setting outside its choices is refused.
- The canvas and the export draw the same sketch, corners and smoothing.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): the hand-drawn outline takes a sketch level, and corners and freehand smoothing are added.

## Impact

The properties panel gains a sketch control and a corner control. The stored document gains fields with defaults on the shape, the sticky note and the arrow. A stored element that lacks a new field reads its default, artist and sharp, so no stored document is rewritten. A freehand stroke saved before the change draws smoothed. This change lands after the stroke-and-fill change, since both add controls to the same panel and the same element models.
