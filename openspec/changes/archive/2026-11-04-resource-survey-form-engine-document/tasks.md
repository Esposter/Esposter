# Tasks

Build order. The foundation and the text kind are the pilot unit; the kinds follow in three groups and touch no shared file.

## 1. Foundation

- [x] 1.1 Write the type enum, the base question props schema, the small models (choice, image choice, matrix column, multiple text item, validator, calculated value), the root props, the definition type, the limits and the text kind, following the webpage document file for file. Test-first, one case per scenario in the spec delta that the text kind can show.
      Verify: the text kind's node schema accepts a valid node and refuses an unknown prop, and the package typecheck of the touched files passes.
- [x] 1.2 Write the shared files that name every kind: the node union, the question union, the placeable union, the children port, the node schema, the registry, the definition map and the document schema.
      Verify: the files import every kind file this design names, and a kind missing from the definition map fails the typecheck.

## 2. Kinds

- [x] 2.1 Build the input kinds: `text` (done in 1.1), `comment`, `boolean`, `radiogroup`, `dropdown`, `checkbox`, `tagbox`, `buttongroup`.
      Verify: each kind has a test that a valid node parses and an unknown prop is refused, and its default props parse.
- [x] 2.2 Build `rating`, `ranking`, `slider`, `expression`, `html`, `image`, `imagepicker`, `multipletext`.
      Verify: as 2.1, and the `html` kind accepts markup without sanitising it, since the sanitiser runs where it renders.
- [x] 2.3 Build `matrix`, `matrixdynamic`, `paneldynamic`, `page` and `panel`.
      Verify: as 2.1, and a dynamic panel's template refuses a dynamic panel.

## 3. Checks

- [x] 3.1 Write `checkSurveyDocument` and `createSurveyDocument`, and the document schema's refinement.
      Verify: each scenario in the spec delta is a test, a refusal names the element's path, and `createSurveyDocument` parses.
