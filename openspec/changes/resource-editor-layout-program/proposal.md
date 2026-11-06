# Editor layout program

## Why

Every editor arranges its screen by hand, in its own component, from the same low-level pieces. The whiteboard is a free canvas yet draws a left palette, a top-left tool row, a bottom-left zoom row and a floating panel. The survey creator, a structured form, draws the same kind of palette and panes as the webpage builder. A freeform editor and a guided one want different screens, and today the only way to give them different screens is to write each one again.

## What Changes

Each editor declares its layout as data, and one headless engine resolves it for the window and for what the reader is doing.

- A freeform editor, the whiteboard, holds every tool in one top toolbar and opens a contextual panel only for what is selected.
- A guided editor, the survey, the email, the webpage and the dashboard, puts structure first, offers only the actions its document accepts, and lists every problem in one place.
- The layout engine is a new headless package. The app's shell renders its answer. The existing grid package stays a separate package, since it places items inside a canvas and the engine places regions around one.
- Headless packages are Vue packages named `vue-<thing>-headless` with one entry holding their functions and their composables, and the editing session the three editor stores repeat becomes one composable.

## Capabilities

- Program umbrella: no spec delta of its own. Each part owns its requirements.

## Impact

Every editor's shell component is replaced by a layout description. The survey creator's tabs, the page builder's panes and the whiteboard's palette and toolbar change places. The palette shell, the density tokens and the overflow menu stay.
