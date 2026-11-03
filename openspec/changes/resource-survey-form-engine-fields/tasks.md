# Tasks

Build order. Each group of fields is independent of the others; the renderer comes last because it imports the map.

## 1. Fields

- [ ] 1.1 Build the `text`, `comment`, `boolean`, `radiogroup` and `dropdown` fields, each held to the component test the [ui-library skill](../../../.agents/skills/ui-library/SKILL.md) requires, run once per style.
      Verify: each field's contract test passes in both styles and its label is the question's title.
- [ ] 1.2 Build the `checkbox`, `tagbox`, `buttongroup`, `rating` and `slider` fields.
      Verify: as 1.1, and select-all, none and other behave as the document's props state.
- [ ] 1.3 Build the `ranking`, `imagepicker`, `multipletext` and `matrix` fields.
      Verify: as 1.1, and the ranking reorder scenario in the spec delta passes.
- [ ] 1.4 Build the `matrixdynamic`, `paneldynamic`, `expression`, `html` and `image` fields.
      Verify: as 1.1, an `html` field removes a script element, and rows and panels add and remove within their bounds.

## 2. Renderer

- [ ] 2.1 Build `SurveyFieldComponentMap`, the field chooser, the page renderer, the panel and the progress bar.
      Verify: a renderer test draws a two-page document, a blocked move focuses the first error's control, and a kind missing from the map fails the typecheck.
