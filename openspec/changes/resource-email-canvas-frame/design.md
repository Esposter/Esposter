# Canvas frame: blocked script and scroll flicker

The page builder draws a page or an email in an iframe, the canvas frame, so the drawing has its own document and its own layout. The frame is sandboxed to keep a drawn page from reaching the owner's session, and it is scaled to fit the pane it sits in.

## How it works

The canvas creates the frame with an empty srcdoc. The frame package's composable then sizes the frame against its pane: a fill or a scale to the pane's width, and a frame height taken from the frame's own content. The canvas draws its nodes into the frame's body through a teleport. Two observers watch the pane and the frame, so each change to either re-sizes the frame.

```mermaid
flowchart TD
  A[canvas frame, sandboxed, empty srcdoc] --> B[frame package composable]
  B --> C[fill or scale to the pane width]
  B --> D[frame height from the frame's content]
  D --> E{pane size depends on the frame size?}
  E -->|yes: a loop| F[scrollbars toggle as the size changes]
  E -->|no: settled| G[steady scroll position]
  A --> H[nodes teleported into the frame body]
  H --> I{a script reaches the frame?}
  I -->|from the app| J[removed at its source]
  I -->|from an extension| K[recorded, canvas unchanged]
```

The loop at `E` is one of the open hypotheses. It is not confirmed, and the reproduction decides it.

## Data model

None.

## Key files

| File                                                                   | Role                                                                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `apps/web/app/components/PageBuilder/Canvas/Frame.vue`                 | the canvas frame: `sandbox="allow-same-origin"`, the empty srcdoc, the teleport of the nodes |
| `apps/web/app/components/PageBuilder/Canvas/Index.vue`                 | the email's body-width wrapper and the node drawing the frame holds                          |
| `packages/vue-canvas-frame-headless/src/composables/useCanvasFrame.ts` | the frame's sizing: fill or scale to the pane, the frame height, and the adopted style sheet |
| `packages/vue-canvas-frame-headless/src/services/constants.ts`         | `CANVAS_FRAME_SRCDOC`, the empty document the frame starts from                              |
| `apps/web/shared/services/resource/note/renderNoteHtml.ts`             | the sanitised note html a text node draws, the one user html the frame receives              |

## Notes

- A script the sandbox blocks is the sandbox doing its job. The fix is to find what tried to run, not to add `allow-scripts`, which would let a drawn page run code beside the owner's session.
- The reproduction is done in the browser, the same way as the other page-builder checks: the dev server running, the email open on the canvas, and the console and the frame's stack read there.
