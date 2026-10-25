## 1. Buttons and navbar links draw their words

- [x] 1.1 Draw a button as its text. Verify: a test named after the scenario 'a button draws its own words', seen failing first. Built in the working tree: the renderer's button branch and the updated button expectation pass in the canvas suite.
- [x] 1.2 Draw each navbar link as its own text in a row. Verify: a test named after the scenario 'a navbar draws each link as its own words in a row', seen failing first. Built in the working tree and passing.

## 2. One drawing per node type

- [ ] 2.1 Move the render callback's type checks into a table keyed by `MjmlNodeType`, typed `Record<MjmlNodeType, EmailCanvasRenderer>`, so a missing type fails the typecheck. Verify: a test named after the scenario 'every email node type has a drawing', seen failing first (the test lists each type of the enum and asserts a drawing for each).
- [ ] 2.2 Remove the fallback that draws a type-name box for an unnamed type. Verify: the same test, plus the scenario 'a content-less type draws the box its table entry names'.

## 3. The starter draws whole

- [ ] 3.1 Draw each part of the starter email with its own content. Verify: a test named after the scenario 'the starter email draws every part with its content', seen failing first.

## 4. Sweep

- [ ] 4.1 Update the [email page builder design](../../specs/resource/page-builder/email/design.md) Key files row for `renderEmailCanvasVNodes.ts` to name the table, and fix any prose that describes the labelled fallback. Verify: the spec tests in `scripts` pass.
