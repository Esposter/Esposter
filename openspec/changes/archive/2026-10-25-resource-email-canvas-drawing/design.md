# Email canvas drawing per node type

Each email node type is drawn by its own drawing, held in one table keyed by the type. The table is typed `as const satisfies { [TType in EmailCanvasType]: EmailCanvasDrawing<TType> }`, where `EmailCanvasType` is MJML's node types plus the one type the app adds, so adding a type without a drawing fails the typecheck. Before this change one callback held a chain of type checks with a fallback at the end, and that fallback is where the labelled boxes came from.

## How it works

The canvas hands each node to the block editor's `renderBlockNodes`, which resolves the node's registry definition and its slots, then calls the render callback. The callback looks the node's drawing up in the table and calls it with a context: the node, its definition, its resolved attribute reader, its slot children and the email kind's width state. The drawing returns a VNode. A section is the one drawing that reads its children directly, since it lays out its columns side by side or stacked.

```mermaid
flowchart LR
  A[renderBlockNodes] --> B[node and definition]
  B --> C{table keyed by email node type}
  C --> D[section: columns side by side or stacked]
  C --> E[text and accordion text: sanitised note html]
  C --> F[button and accordion title: their words]
  C --> G[containers: their slot children]
  C --> H[raw and table: their sanitised html]
  C --> I[spacer: the gap its height names]
  C --> J[pictures and social rows: a labelled box]
```

Every branch of the table is explicit, so a reader can see which type draws what without tracing a fallback.

## Data model

None. The drawing reads the document as it is.

## Key files

| File                                                                             | Role                                                                                                                      |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/services/pageBuilder/email/renderEmailCanvasVNodes.ts`             | the render callback; it resolves each node through the table instead of a chain of type checks                            |
| `apps/web/app/services/pageBuilder/email/canvasDrawing/EmailCanvasDrawingMap.ts` | the table keyed by email node type, naming the drawing of each; each drawing is one file beside it                        |
| `apps/web/app/services/pageBuilder/email/renderEmailCanvasVNodes.test.ts`        | the drawing's tests: the button and navbar link draw their words, and the starter email draws every part with its content |
| `apps/web/shared/services/pageBuilder/email/starterEmailSource.ts`               | the starter email, the one document that must draw every part with its content (read only)                                |
| `packages/mjml-blocks/src/models/MjmlNodeType.ts`                                | the enum the table is keyed by, so a new type is a new key the typecheck requires (read only)                             |

## Notes

- The web page canvas already draws each node through a per-type path (`renderWebpageNode`) that the published page shares. That precedent is the same shape: one drawing per type, chosen by the node's type. No outside source was read for this pattern, so none is cited.
- A button's and an accordion title's text is the node's `content` prop. A navbar link's text is its `content` prop, and a link is drawn as an inline element so a navbar lays its links in one row.
- Pictures (an image, a carousel image) and a social row keep the labelled box. Their content is a picture the canvas does not load, so the box names the type rather than a word, and the starter's social row is the one part drawn that way.
- A spacer is drawn with no label, since the gap its height names is all it holds.
