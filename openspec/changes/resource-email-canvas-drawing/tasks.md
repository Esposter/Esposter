## 1. Buttons and navbar links draw their words

- [x] 1.1 Draw a button as its text. Verify: a test named after the scenario 'a button draws its own words', seen failing first. Built in the working tree: the renderer's button branch and the updated button expectation pass in the canvas suite.
- [x] 1.2 Draw each navbar link as its own text in a row. Verify: a test named after the scenario 'a navbar draws each link as its own words in a row', seen failing first. Built in the working tree and passing.

## 2. One drawing per node type

- [x] 2.1 Key the drawings by node type (`MjmlNodeType`, plus `EmailNodeType.SurveyInvite`, the one email-only type) in one map, each drawing in its own file, dispatched by one expression. Verify: the map is typed `as const satisfies { [TType in EmailCanvasType]: EmailCanvasDrawing<TType> }`, so a built-in type with no drawing fails the typecheck. A test would repeat that check, so none is written.
- [x] 2.2 Remove the fallback that draws a type-name box for an unnamed built-in type. Verify: the same typecheck as 2.1; the labelled box stays only as the drawing of the leaf types the map names.

## 3. The starter draws whole

- [ ] 3.1 Draw each part of the starter email with its own content. Verify: a test named after the scenario 'the starter email draws every part with its content', seen failing first. Open: the starter's render has no test yet.

## 4. Sweep

- [ ] 4.1 Update the [email page builder design](../../specs/resource/page-builder/email/design.md) Key files row for `renderEmailCanvasVNodes.ts` to name the map, and fix any prose that describes the labelled fallback. Verify: the spec tests in `scripts` pass.
